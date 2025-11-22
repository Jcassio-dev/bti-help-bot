import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

export default class HorariosCommand extends BaseCommand {
  name = "horarios";
  description = "Exibe os horários dos turnos disponíveis.";
  aliases = ["turno", "horario", "h", "turnos"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const turns = {
      matutino: {
        letter: "M",
        schedules: [
          "07h00 às 07h50",
          "07h50 às 08h40",
          "08h50 às 09h40",
          "09h40 às 10h30",
          "10h40 às 11h30",
          "11h30 às 12h20",
        ],
      },
      vespertino: {
        letter: "V",
        schedules: [
          "13h00 às 13h50",
          "13h50 às 14h40",
          "14h50 às 15h40",
          "15h40 às 16h30",
          "16h40 às 17h30",
          "17h30 às 18h20",
        ],
      },
      noturno: {
        letter: "N",
        schedules: [
          "18h40 às 19h30",
          "19h30 às 20h20",
          "20h30 às 21h20",
          "21h20 às 22h10",
        ],
      },
    };

    const type = (args[0]?.toLowerCase() as keyof typeof turns) || "";

    if (!type || !turns[type]) {
      return `Tente: !horarios <nome-do-turno>\nDisponíveis:\n${Object.keys(
        turns
      ).join("\n")}`;
    }

    const { schedules, letter } = turns[type];
    const message = schedules.reduce((acc, curr, index) => {
      return acc + `(${letter}${index + 1}) ${curr}\n`;
    }, `*${type}*\n`);

    return message;
  }
}
