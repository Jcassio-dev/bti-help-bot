import { WAMessage, WASocket } from "baileys";
import { Command } from "../types/command";

const menuCommand: Command = {
  name: "menu",
  description: "Mostra a lista de comandos disponíveis.",
  aliases: ["ajuda", "comandos", "help"],
  privateRestricted: false,
  execute: async (
    sock: WASocket,
    msg: WAMessage,
    args: string[],
    allCommands?: Map<string, Command>
  ): Promise<string | null | undefined> => {
    if (!allCommands) {
      return "Desculpe, não consegui carregar a lista de comandos no momento.";
    }

    let menuText = "📜 *Menu de Comandos Disponíveis:*\n\n";

    const uniqueCommands = new Set<Command>(allCommands.values());

    for (const cmd of Array.from(uniqueCommands)) {
      if (cmd.name === "menu") continue;
      menuText += `• *!${cmd.name}*: ${cmd.description || "Sem descrição."}\n`;
    }

    if (
      uniqueCommands.size <= 1 &&
      uniqueCommands.values().next().value?.name === "menu"
    ) {
      menuText += "_Nenhum outro comando disponível no momento._";
    }

    return menuText;
  },
  loggable: true,
};

export default menuCommand;
