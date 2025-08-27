import { WAMessage, WASocket } from "baileys";
import { Command } from "../types/command";
import { pesFields } from "../resources/constants/imd-pes";

const pesCommand: Command = {
  name: "pes",
  description:
    "Informa a grade necessária para conseguir o certificado de cada PES.",
  aliases: [],
  privateRestricted: false,
  execute: async (
    sock: WASocket,
    msg: WAMessage,
    args: string[]
  ): Promise<string | null | undefined> => {
    const pes = (args[0]?.toLowerCase() as keyof typeof pesFields) || "";

    if (!pes || !pesFields[pes]) {
      return `Tente: !pes <nome-do-pes>\nDisponíveis:\n${Object.entries(
        pesFields
      )
        .map(([key, value]) => `- ${key} | ${value.fullName}`)
        .join("\n")}`;
    }

    const { fullName, courses } = pesFields[pes];

    const message = `
*PES DE ${fullName}*
total de matérias: ${courses.length} (${courses
      .map((course) => course.ch)
      .reduce((a, b) => a + b, 0)}h)

${courses
  .map((course) => `[${course.cod}] - ${course.name} (${course.ch}h)`)
  .join("\n")}

    `;

    return message;
  },
  loggable: true,
};

export default pesCommand;
