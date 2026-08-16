import axios from "axios";
import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

const API = process.env.API_BASE_URL || "http://localhost:8080";
const KEY = process.env.API_SECRET_KEY;

export default class SugestaoCommand extends BaseCommand {
  name = "sugestao";
  description = "Envie uma sugestão ou ideia pro bot. Uso: !sugestao <sua ideia>";
  aliases = ["sugestão", "feedback", "ideia"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const texto = args.join(" ").trim();
    if (texto.length < 3) {
      return "Manda a sugestão junto! Ex: *!sugestao adiciona um comando de horário do ônibus*";
    }

    const userId = msg.key.participant || msg.key.remoteJid || null;

    try {
      await axios.post(
        `${API}/api/sugestao`,
        { texto, userId },
        { headers: { "X-API-Key": KEY } }
      );
      return "Sugestão registrada, valeu! Vou avaliar pro backlog.";
    } catch (error) {
      return "Ops, não consegui registrar agora. Tenta de novo em instantes.";
    }
  }
}
