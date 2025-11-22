import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

export default class PingCommand extends BaseCommand {
  name = "ping";
  description = "Responde com Pong!";
  aliases = ["p"];
  privateRestricted = false;
  loggable = false;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    return "Pong!";
  }
}
