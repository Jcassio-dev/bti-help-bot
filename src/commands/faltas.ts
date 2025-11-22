import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

export default class FaltasCommand extends BaseCommand {
  name = "faltas";
  description = "responde com o número limite de faltas permitidas";
  aliases = ["faltas", "faltaspermitidas", "faltaslimite", "f"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const hours = [30, 45, 60, 75, 90, 120];
    const missingClasses = hours.map((hour) => ({
      hour,
      misses: (hour * 0.3).toFixed(0),
    }));

    const message = missingClasses.reduce((acc, curr) => {
      return acc + `${curr.hour}h: ${curr.misses} faltas\n`;
    }, "*Bom semestre!* \n");

    return message;
  }
}
