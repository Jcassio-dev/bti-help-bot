import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { ApiService } from "../services/api.service";
import { CooldownService } from "../services/cooldown.service";
import { StrategyFactory } from "../factories/strategy.factory";
import { CommandFactory } from "../factories/command.factory";
import { parseMessage } from "../utils/message-parser";
import { UserValidator } from "../utils/user-validator";
import { validateMessageContext } from "../utils/message-validator";

const commandPrefix = "!";

export async function handleMessages(
  sock: WASocket,
  apiService: ApiService = new ApiService(),
  cooldownService: CooldownService = CooldownService.getInstance(),
  commandFactory: CommandFactory = new CommandFactory()
) {
  await commandFactory.loadCommands();

  const userValidator = new UserValidator(cooldownService);

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];

    if (!msg.message || msg.key.fromMe) return;

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
      subCommand
    );

    if (!validation.valid) return;

    userValidator.setCooldown(messageContext.userId, command.name, subCommand);

    if (command.loggable) {
      apiService.registerLog({
        command: command.name,
        userId: messageContext.userId,
        groupId: messageContext.isGroupMessage ? msg.key.remoteJid! : null,
      });
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
      await strategy.execute(
        sock,
        messageContext.finalReplyToJid,
        messageToSend,
        msg
      );
    } catch (error) {
      console.error(`Erro ao executar comando ${commandName}:`, error);
      await sock.sendMessage(
        messageContext.finalReplyToJid,
        { text: "Ocorreu um erro ao tentar executar esse comando." },
        { quoted: msg }
      );
    }
  });
}
