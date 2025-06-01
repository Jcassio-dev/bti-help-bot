import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import * as fs from "fs";
import * as path from "path";
import { Command } from "../types/command";

const commands = new Map<string, Command>();
const commandPrefix = "!";

async function loadCommands() {
  const commandsPath = path.join(__dirname, "..", "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      const commandModule = await import(filePath);
      const command: Command = commandModule.default;

      if (command && command.name && typeof command.execute === "function") {
        commands.set(command.name, command);
        if (command.aliases) {
          command.aliases.forEach((alias: string) =>
            commands.set(alias, command)
          );
        }
        console.log(`Comando carregado: ${command.name}`);
      } else {
        console.warn(`Arquivo de comando inválido: ${file}`);
      }
    } catch (error) {
      console.error(`Erro ao carregar comando ${file}:`, error);
    }
  }
}

export async function handleMessages(sock: WASocket) {
  await loadCommands();

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const messageContent =
      msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!messageContent || !messageContent.startsWith(commandPrefix)) return;

    const args = messageContent.slice(commandPrefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = commands.get(commandName);

    if (!command) {
      const defaultReplyToJid = msg.key.participant || msg.key.remoteJid;
      if (defaultReplyToJid) {
        await sock.sendMessage(
          defaultReplyToJid,
          { text: "Comando não encontrado." },
          { quoted: msg }
        );
      } else {
        console.error(
          "Comando não encontrado e não foi possível determinar JID para resposta.",
          msg.key
        );
      }
      return;
    }

    let finalReplyToJid: string | undefined | null;
    const isGroupMessage =
      !!msg.key.participant && msg.key.remoteJid?.endsWith("@g.us");

    if (isGroupMessage) {
      if (command.privateRestricted === false) {
        finalReplyToJid = msg.key.remoteJid;
      } else {
        finalReplyToJid = msg.key.participant;
      }
    } else {
      finalReplyToJid = msg.key.remoteJid;
    }

    if (!finalReplyToJid) {
      console.error(
        "Não foi possível determinar o JID para resposta para o comando.",
        msg.key
      );
      return;
    }

    try {
      const responseContent = await command.execute(sock, msg, args, commands);

      if (responseContent) {
        let messageToSend: AnyMessageContent;
        if (typeof responseContent === "string") {
          messageToSend = { text: responseContent };
        } else {
          messageToSend = responseContent;
        }
        await sock.sendMessage(finalReplyToJid, messageToSend, { quoted: msg });
      }
    } catch (error) {
      console.error(`Erro ao executar comando ${commandName}:`, error);
      await sock.sendMessage(
        finalReplyToJid,
        { text: "Ocorreu um erro ao tentar executar esse comando." },
        { quoted: msg }
      );
    }
  });
}
