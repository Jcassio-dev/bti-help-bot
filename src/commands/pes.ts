import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { pesFields } from "../resources/constants/imd-pes";

export default class PesCommand extends BaseCommand {
  name = "pes";
  description =
    "Informa a grade necessária para conseguir o certificado de cada PES.";
  aliases = [];
  privateRestricted = true;
  loggable = true;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const pes = (args[0]?.toLowerCase() as keyof typeof pesFields) || "";

    if (!pes || !pesFields[pes]) {
      return `Tente: !pes <nome-do-pes>\nDisponíveis:\n${Object.entries(
        pesFields
      )
        .map(([key, value]) => `- ${key} | ${value.fullName}`)
        .join("\n")}

      fonte:<https://hongkong.imd.ufrn.br/filemanagerportal/source/RESOLUCAO_N_041_2025_PES-IMD.pdf>
      `;
    }

    const { fullName, courses, chMin } = pesFields[pes];

    const optativeCourses = courses.filter((c) => c.optative);
    const mandatoryCourses = courses.filter((c) => !c.optative);

    const message = `
*PES DE ${fullName}*
Carga horária mínima: ${chMin}h

Matérias obrigatórias--------------------------
${mandatoryCourses
  .map((course) => `[${course.cod}] - ${course.name} (${course.ch}h)`)
  .join("\n")}

Matérias optativas-----------------------------
${optativeCourses
  .map((course) => `[${course.cod}] - ${course.name} (${course.ch}h)`)
  .join("\n")}

fonte:<https://hongkong.imd.ufrn.br/filemanagerportal/source/RESOLUCAO_N_041_2025_PES-IMD.pdf>
    `;

    return message;
  }
}
