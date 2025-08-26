import { WAMessage, WASocket } from "baileys";
import { Command } from "../types/command";

const pesCommand: Command = {
  name: "pes",
  description: "Informa a grade necessária para conseguir o certificado de cada PES.",
  aliases: [],
  privateRestricted: false,
  execute: async (
    sock: WASocket,
    msg: WAMessage,
    args: string[]
  ): Promise<string | null | undefined> => {
    const turns = {
      iot:  [
         
        ],
       
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
  },
  loggable: true,
};

export default pesCommand;
