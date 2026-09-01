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

    const uniqueCommands = new Set<BaseCommand>(allCommands.values());

    const secoes = new Map<string, BaseCommand[]>();
    for (const cmd of uniqueCommands) {
      if (cmd.name === "menu" || cmd.hidden || (cmd.acesso && cmd.acesso !== "todos")) continue;
      const secao = cmd.categoria || "Geral";
      if (!secoes.has(secao)) secoes.set(secao, []);
      secoes.get(secao)!.push(cmd);
    }

    if (secoes.size === 0) {
      return "📜 *Menu de Comandos*\n\n_Nenhum comando disponível no momento._";
    }

    const ordem = (nome: string) => (nome === "Geral" ? 0 : nome === "SIGAA" ? 1 : 2);
    const nomes = Array.from(secoes.keys()).sort((a, b) => ordem(a) - ordem(b) || a.localeCompare(b));

    let menuText = "📜 *Menu de Comandos*\n";
    for (const nome of nomes) {
      menuText += `\n*${nome}*\n`;
      for (const cmd of secoes.get(nome)!) {
        menuText += `• *!${cmd.name}*: ${cmd.description || "Sem descrição."}\n`;
      }
    }

    return menuText;
  }
}
