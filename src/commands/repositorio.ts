import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

export default class RepositorioCommand extends BaseCommand {
  name = "repositorio";
  description = "Manda o link do repositório do bot";
  aliases = [
    "repo",
    "github",
    "source",
    "sourcecode",
    "code",
    "codigo",
    "star",
  ];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    return "Você pode encontrar e colaborar com o meu código no seguinte repositório:\nhttps://github.com/Jcassio-dev/bti-help-bot";
  }
}
