import axios from "axios";
import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

const API = process.env.API_BASE_URL || "http://localhost:8080";
const KEY = process.env.API_SECRET_KEY;
const EXPIRA_MS = 10 * 60 * 1000;

export default class SugestaoCommand extends BaseCommand {
  name = "sugestao";
  description = "Envie uma sugestão ou ideia pro bot. Uso: !sgt <sua ideia>";
  aliases = ["sgt", "sugestão", "feedback", "ideia"];
  privateRestricted = true;
  loggable = true;

  private pendentes = new Map<string, { texto: string; ts: number }>();

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const isGroup = (msg.key.remoteJid || "").endsWith("@g.us");
    const userId = isGroup ? msg.key.participant || "" : msg.key.remoteJid || "";

    const sub = (args[0] || "").toLowerCase();

    if (sub === "sim" || sub === "nao" || sub === "não") {
      const pend = this.pendentes.get(userId);
      if (!pend || Date.now() - pend.ts > EXPIRA_MS) {
        return "Sua sugestão expirou. Manda de novo com *!sgt <ideia>*.";
      }
      this.pendentes.delete(userId);
      const registrar = sub === "sim";
      const contato = registrar ? userId.split("@")[0] : null;
      const nome = registrar ? msg.pushName || null : null;
      return this.salvar(pend.texto, contato, nome);
    }

    if (sub === "cancelar") {
      this.pendentes.delete(userId);
      return "Beleza, nem queria mesmo...";
    }

    const texto = args.join(" ").trim();
    if (texto.length < 3) {
      return "Manda a sugestão junto! Ex: *!sgt adiciona um comando que aumenta o IRA*";
    }

    this.pendentes.set(userId, { texto, ts: Date.now() });
    return (
      `Vou salvar a sugestão:\n\n_"${texto}"_\n\n` +
      `Confirma? Responda:\n` +
      `• *!sgt sim* - registra seu contato\n` +
      `• *!sgt nao* - anônimo\n` +
      `• *!sgt cancelar* - descarta`
    );
  }

  private async salvar(
    texto: string,
    contato: string | null,
    nome: string | null
  ): Promise<string> {
    try {
      await axios.post(
        `${API}/api/sugestao`,
        { texto, userId: contato, nome },
        { headers: { "X-API-Key": KEY } }
      );
      return "Muito obrigado, nossa equipe (1 pessoa) vai avaliar sua sugestão!";
    } catch (error) {
      return "Ops, não consegui registrar agora. Tenta de novo depois.";
    }
  }
}
