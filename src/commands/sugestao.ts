import axios from "axios";
import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

const API = process.env.API_BASE_URL || "http://localhost:8080";
const KEY = process.env.API_SECRET_KEY;
const EXPIRA_MS = 10 * 60 * 1000;

export default class SugestaoCommand extends BaseCommand {
  name = "sugestao";
  description = "Envie uma sugestão ou ideia pro bot. Uso: !sugestao <sua ideia>";
  aliases = ["sugestão", "feedback", "ideia"];
  privateRestricted = true;
  loggable = true;

  private pendentes = new Map<string, { texto: string; ts: number }>();

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const userId = msg.key.participant || msg.key.remoteJid || "";
    const sub = (args[0] || "").toLowerCase();

    if (sub === "contato") {
      const pend = this.pendentes.get(userId);
      if (!pend || Date.now() - pend.ts > EXPIRA_MS) {
        return "Sua sugestão expirou. Manda de novo com *!sugestao <ideia>*.";
      }
      this.pendentes.delete(userId);
      const contato = (args[1] || "").toLowerCase() === "sim" ? userId.split("@")[0] : null;
      return this.salvar(pend.texto, contato);
    }

    if (sub === "confirmar") {
      const pend = this.pendentes.get(userId);
      if (!pend || Date.now() - pend.ts > EXPIRA_MS) {
        return "Não achei sugestão pra confirmar. Manda *!sugestao <sua ideia>* primeiro.";
      }
      pend.ts = Date.now();
      return {
        text: "Posso registrar seu contato para eventuais dúvidas sobre a sugestão?",
        footer: "Sua sugestão será guardada de qualquer forma.",
        title: "Contato",
        buttonText: "Responder",
        sections: [
          {
            title: "Escolha uma opção",
            rows: [
              { title: "Sim, pode registrar", rowId: "!sugestao contato sim" },
              { title: "Não, obrigado", rowId: "!sugestao contato nao" },
            ],
          },
        ],
      } as unknown as AnyMessageContent;
    }

    const texto = args.join(" ").trim();
    if (texto.length < 3) {
      return "Manda a sugestão junto! Ex: *!sugestao adiciona um comando de horário do ônibus*";
    }

    this.pendentes.set(userId, { texto, ts: Date.now() });
    return (
      `Será salva a sugestão:\n\n_"${texto}"_\n\n` +
      `Envie *!sugestao confirmar* para guardar.`
    );
  }

  private async salvar(texto: string, contato: string | null): Promise<string> {
    try {
      await axios.post(
        `${API}/api/sugestao`,
        { texto, userId: contato },
        { headers: { "X-API-Key": KEY } }
      );
      return "Muito obrigado, nossa equipe vai avaliar sua sugestão!";
    } catch (error) {
      return "Ops, não consegui registrar agora. Tenta de novo em instantes.";
    }
  }
}
