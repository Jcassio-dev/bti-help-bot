import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

export default class MenuCommand extends BaseCommand {
  name = "menu";
  description = "Mostra a lista de comandos disponíveis.";
  aliases = ["ajuda", "comandos", "help"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[],
    allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    if (!allCommands) {
      return "Desculpe, não consegui carregar a lista de comandos no momento.";
    }

    let menuText = "📜 *Menu de Comandos Disponíveis:*\n\n";

    const uniqueCommands = new Set<BaseCommand>(allCommands.values());

    for (const cmd of Array.from(uniqueCommands)) {
      if (cmd.name === "menu" || cmd.hidden) continue;
      menuText += `• *!${cmd.name}*: ${cmd.description || "Sem descrição."}\n`;
    }

    if (
      uniqueCommands.size <= 1 &&
      uniqueCommands.values().next().value?.name === "menu"
    ) {
      menuText += "_Nenhum outro comando disponível no momento._";
    }

    return menuText;
  }
}
