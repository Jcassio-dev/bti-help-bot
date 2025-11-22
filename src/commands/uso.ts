import axios from "axios";
import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

export default class UsoCommand extends BaseCommand {
  name = "uso";
  description =
    "Faz uma requisição no servidor e vê quantos comandos você já usou.";
  aliases = ["eu", "chamadas"];
  privateRestricted = true;
  loggable = false;

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const userId = msg.key.participant || msg.key.remoteJid;
    const apiUrl = process.env.API_BASE_URL || "http://localhost:3000";

    if (!userId) return "Não foi possível identificar o usuário.";

    try {
      const { data: commandCount } = await axios.get(
        `${apiUrl}/api/logs/user-command-count`,
        {
          params: {
            userId,
          },
        }
      );
      return `Você já enviou ${commandCount} comandos. \n para ver o uso geral acesse: https://bti-hp-dashboard.vercel.app/\n\n _OBS.: desde 17/08/2025 :D_`;
    } catch (error) {
      console.error("Erro ao buscar contagem de comandos:", error);
      return "Ocorreu um erro ao buscar sua contagem de comandos.";
    }
  }
}
