import axios from "axios";
import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

const API = process.env.API_BASE_URL || "http://localhost:8080";
const KEY = process.env.API_SECRET_KEY;
const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

interface SugestaoDTO {
  id: number;
  texto: string;
  userId: string | null;
  nome: string | null;
  criadoEm: string;
}

export default class SugestoesCommand extends BaseCommand {
  name = "sugestoes";
  description = "Lista as sugestões (moderadores).";
  aliases = ["sugestões", "backlog"];
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

    try {
      const { data } = await axios.get<SugestaoDTO[]>(`${API}/api/sugestao`, {
        headers: { "X-API-Key": KEY },
      });
      if (!Array.isArray(data) || data.length === 0) {
        return "Nenhuma sugestão registrada ainda.";
      }
      const linhas = data.slice(0, 30).map((s, i) => {
        const quando = new Date(s.criadoEm).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "America/Recife",
        });
        const contato = s.userId
          ? s.nome
            ? `${s.nome} - ${s.userId}`
            : s.userId
          : "Anônimo";
        return `*${i + 1} - ${contato}* _(${quando})_\n${s.texto}`;
      });
      return `*Backlog de sugestões* (${data.length})\n\n${linhas.join("\n\n")}`;
    } catch (error) {
      return "Ops, não consegui listar as sugestões agora.";
    }
  }
}
