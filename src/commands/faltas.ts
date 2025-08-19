import { WAMessage, WASocket } from "baileys";
import { Command } from "../types/command";

const absenceCommand: Command = {
  name: "faltas",
  description: "responde com o número limite de faltas permitidas",
  aliases: ["faltas", "faltaspermitidas", "faltaslimite", "f"],
  privateRestricted: false,
  execute: async () => {
    const hours = [30, 45, 60, 75, 90, 120];
    const missingClasses = hours.map((hour) => ({
      hour,
      misses: (hour * 0.3).toFixed(0),
    }));

    const message = missingClasses.reduce((acc, curr) => {
      return acc + `${curr.hour}h: ${curr.misses} faltas\n`;
    }, "*Bom semestre!* \n");

    return message;
  },
  loggable: true,
};

export default absenceCommand;
