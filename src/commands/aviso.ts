import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export default class AvisoCommand extends BaseCommand {
  name = "aviso";
  description = "Envia um aviso (restrito a moderadores).";
  aliases = [];
  privateRestricted = false;
  loggable = false;
  hidden = true;

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const sender = (msg.key.participant || msg.key.remoteJid || "").split("@")[0];
    if (ADMIN_IDS.length === 0 || !ADMIN_IDS.includes(sender)) {
      return "Comando restrito a moderadores.";
    }

    const raw = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? "";
    const texto = raw.replace(/^\s*!aviso\s*/i, "").trim();

    if (!texto) {
      return "Uso: *!aviso <mensagem>*. Em modo prévia, a mensagem só é ecoada aqui.";
    }

    return `*[PRÉVIA — não enviado aos grupos]*\n\n${texto}`;
  }
}
