import { WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const EXPIRA_MS = 5 * 60 * 1000;
const DELAY_MS = 1500;

export default class AvisoCommand extends BaseCommand {
  name = "aviso";
  description = "Envia um aviso (restrito a moderadores).";
  aliases = [];
  privateRestricted = false;
  loggable = false;
  hidden = true;

  private pendentes = new Map<string, { texto: string; ts: number }>();

  async execute(
    sock: WASocket,
    msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<string> {
    const sender = (msg.key.participant || msg.key.remoteJid || "").split("@")[0];
    if (ADMIN_IDS.length === 0 || !ADMIN_IDS.includes(sender)) {
      return "Comando restrito a moderadores.";
    }

    const raw = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? "";
    const texto = raw.replace(/^\s*!aviso\s*/i, "").trim();

    if (texto.toLowerCase() === "confirmar") {
      const pend = this.pendentes.get(sender);
      if (!pend || Date.now() - pend.ts > EXPIRA_MS) {
        return "Nada pra confirmar. Use *!aviso <mensagem>* primeiro (a confirmação expira em 5 min).";
      }
      this.pendentes.delete(sender);
      this.broadcast(sock, pend.texto, msg.key.remoteJid!);
      return "Disparando o aviso para os grupos... você recebe um resumo no fim.";
    }

    if (!texto) {
      return "Uso: *!aviso <mensagem>*.";
    }

    this.pendentes.set(sender, { texto, ts: Date.now() });
    return (
      `*[PRÉVIA — não enviado ainda]*\n\n${texto}\n\n` +
      `---\nPara enviar a TODOS os grupos, responda *!aviso confirmar* (expira em 5 min).`
    );
  }

  private async broadcast(sock: WASocket, texto: string, adminChat: string): Promise<void> {
    try {
      const grupos = await sock.groupFetchAllParticipating();
      const jids = Object.keys(grupos);
      let enviados = 0;
      for (const jid of jids) {
        try {
          await sock.sendMessage(jid, { text: texto });
          enviados++;
        } catch {}
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
      await sock.sendMessage(adminChat, {
        text: `Aviso enviado para ${enviados} de ${jids.length} grupos.`,
      });
    } catch {
      try {
        await sock.sendMessage(adminChat, { text: "Falha ao enviar o aviso aos grupos." });
      } catch {}
    }
  }
}
