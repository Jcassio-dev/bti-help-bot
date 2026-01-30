import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { ApiService } from "../services/api.service";
import { CooldownService } from "../services/cooldown.service";
import { StrategyFactory } from "../factories/strategy.factory";
import { CommandFactory } from "../factories/command.factory";
import { parseMessage } from "../utils/message-parser";
import { UserValidator } from "../utils/user-validator";
import { validateMessageContext } from "../utils/message-validator";
import { logger } from "../services/logger.service";

export async function handleMessages(
  sock: WASocket,
  apiService: ApiService = new ApiService(),
  cooldownService: CooldownService = CooldownService.getInstance(),
  commandFactory: CommandFactory = new CommandFactory()
) {
  const userValidator = new UserValidator(cooldownService);
  // Cooldown por comando por grupo
  const groupCommandCooldowns = new Map<string, Map<string, number>>();
  let lastMessageTime = 0;
  const MIN_MESSAGE_INTERVAL = 1000;
  const GROUP_MESSAGE_INTERVAL = 3000; 

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const messageAge = Date.now() - (msg.messageTimestamp as number) * 1000;
    if (messageAge > 30000) {
      logger.debug({ messageAge: Math.round(messageAge/1000) }, "Mensagem antiga ignorada");
      return;
    }

    const isGroup = msg.key.remoteJid?.endsWith('@g.us');
    const chatId = msg.key.remoteJid!;
    
    if (isGroup) {
      const commandKey = (() => {
        const rawText = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!rawText) return "unknown";
        const match = rawText.match(/^!(\w+)/);
        return match ? match[1].toLowerCase() : "unknown";
      })();
      let groupCooldowns = groupCommandCooldowns.get(chatId);
      if (!groupCooldowns) {
        groupCooldowns = new Map<string, number>();
        groupCommandCooldowns.set(chatId, groupCooldowns);
      }
      const lastCommandTime = groupCooldowns.get(commandKey) || 0;
      const timeSinceLastCommand = Date.now() - lastCommandTime;
      if (timeSinceLastCommand < GROUP_MESSAGE_INTERVAL) {
        logger.debug({ chatId, commandKey, waitTime: GROUP_MESSAGE_INTERVAL - timeSinceLastCommand }, "Aguardando intervalo de grupo por comando");
        await sock.sendMessage(
          chatId,
          { text: `Aguarde 2 minutos para enviar o comando !${commandKey} novamente neste grupo.` }
        );
        return;
      }
      groupCooldowns.set(commandKey, Date.now());
    } else {
      const timeSinceLastMessage = Date.now() - lastMessageTime;
      if (timeSinceLastMessage < MIN_MESSAGE_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_MESSAGE_INTERVAL - timeSinceLastMessage));
      }
    }
    lastMessageTime = Date.now();

    if (msg.message.ephemeralMessage) {
      msg.message = msg.message.ephemeralMessage.message;
    }

    const messageContent =
      msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!messageContent) return;

    const parsed = parseMessage(messageContent);
    if (!parsed.isCommand || !parsed.commandName) return;

    const { commandName, args } = parsed;
    const command = commandFactory.createCommand(commandName);

    if (!command) {
      const menuCommand = commandFactory.createCommand("menu");
      const menuContent = await menuCommand?.execute(
        sock,
        msg,
        args,
        commandFactory.createAllCommands()
      );
      const strategy = StrategyFactory.createStrategy("text");

      await strategy.execute(
        sock,
        msg.key.participant || msg.key.remoteJid!,
        { text: `Comando não encontrado.\n${menuContent}` },
        msg
      );
      return;
    }

    const messageContext = validateMessageContext(msg, command);
    const subCommand = args[0]?.toLowerCase();

    const validation = userValidator.validateUser(
      messageContext.userId,
      command,
      subCommand,
      messageContext.isGroupMessage
    );

    if (!validation.valid) {
      if (validation.reason === "cooldown" && validation.timeLeft) {
          return; 
      }
      return;
    }

    userValidator.setCooldown(messageContext.userId, command.name, subCommand, messageContext.isGroupMessage);

    if (command.loggable) {
      apiService.registerLog({
        command: command.name,
        userId: messageContext.userId,
        groupId: messageContext.isGroupMessage ? msg.key.remoteJid! : null,
      }).catch((err) => logger.error({ err }, "Erro ao registrar log"));
    }

    try {
      const responseContent = await command.execute(
        sock,
        msg,
        args,
        commandFactory.createAllCommands()
      );
      if (!responseContent) throw new Error("Comando não retornou conteúdo.");
      const responseIsString = typeof responseContent === "string";

      const messageToSend = responseIsString
        ? { text: responseContent as string }
        : (responseContent as AnyMessageContent);

      const strategyType = responseIsString ? "text" : "image";
      const strategy = StrategyFactory.createStrategy(strategyType);
      
      let retries = 0;
      const maxRetries = 3;
      while (retries < maxRetries) {
        try {
          await strategy.execute(
            sock,
            messageContext.finalReplyToJid,
            messageToSend,
            msg
          );
          break; 
        } catch (sendError: any) {
          if (sendError?.message?.includes("too many times") && retries < maxRetries - 1) {
            const backoffTime = Math.pow(2, retries) * 2000; 
            logger.warn({ backoffTime }, "Rate limit detectado. Aguardando...");
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            retries++;
          } else {
            throw sendError;
          }
        }
      }
    } catch (error: any) {
      logger.error({ error, commandName }, "Erro ao executar comando");
      
      if (error?.message?.includes("too many times")) {
        logger.warn("Rate limit atingido. Mensagem não enviada");
        return;
      }
      
      try {
        await sock.sendMessage(
          messageContext.finalReplyToJid,
          { text: "Ocorreu um erro ao tentar executar esse comando." },
          { quoted: msg }
        );
      } catch (sendError) {
        logger.error({ sendError }, "Erro ao enviar mensagem de erro");
      }
    }
  });
}
