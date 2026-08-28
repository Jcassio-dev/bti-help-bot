import axios from "axios";
import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { ehAdmin, remetente } from "../core/permissoes";

const API = process.env.API_BASE_URL || "http://localhost:8080";
const KEY = process.env.API_SECRET_KEY;

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
  acesso: "admin" = "admin";
  hidden = true;

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const sender = remetente(msg);
    if (!ehAdmin(sender)) {
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
