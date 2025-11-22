import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

export default class DashboardCommand extends BaseCommand {
  name = "dashboard";
  description = "Retorna o link para o painel geral do bot.";
  aliases = ["painel", "dash"];
  privateRestricted = false;
  loggable = false;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    return `Para ver o uso geral do bot acesse: https://bti-hp-dashboard.vercel.app/`;
  }
}
