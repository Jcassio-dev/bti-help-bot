import { WAMessage, WASocket, AnyMessageContent } from "baileys";
import { Command } from "../types/command";
import * as path from "path";
import * as fs from "fs";

interface GradeInfo {
  filename: string;
  caption: string;
}

const grades: Record<string, GradeInfo> = {
  noturno: {
    filename: "grade-geral.jpeg",
    caption: "Essa é a grade Geral do Noturno.",
  },
  integral: {
    filename: "grade-geral-i.jpeg",
    caption: "Essa é a grade Geral do Integral.",
  },
  cc: {
    filename: "grade-cc.jpeg",
    caption: "Essa é a grade da ênfase em Ciência da Computação.",
  },
  es: {
    filename: "grade-es.jpeg",
    caption: "Essa é a grade da ênfase em Engenharia de Software.",
  },
};

const gradeCommand: Command = {
  name: "grade",
  description: "Envia a imagem da grade curricular especificada.",
  aliases: ["grades", "curricular"],
  privateRestricted: false,
  execute: async (
    sock: WASocket,
    msg: WAMessage,
    args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> => {
    const type = args[0]?.toLowerCase();

    if (!type || !grades[type]) {
      return `Tente: !grade <nome-da-grade>\nDisponíveis:\n${Object.keys(
        grades
      ).join("\n")}`;
    }

    const gradeInfo = grades[type];

    const finalImagePath = path.resolve(
      __dirname,
      "..",
      "resources",
      "imgs",
      gradeInfo.filename
    );

    try {
      if (!fs.existsSync(finalImagePath)) {
        console.error(
          `Arquivo de imagem da grade "${type}" não encontrado:`,
          finalImagePath
        );
        return `Desculpe, não consegui encontrar a imagem da grade "${type}" no momento.`;
      }

      const imageBuffer = fs.readFileSync(finalImagePath);

      const messageToSend: AnyMessageContent = {
        image: imageBuffer,
        caption: gradeInfo.caption,
      };
      return messageToSend;
    } catch (error) {
      console.error(
        `Erro ao ler ou preparar a imagem da grade "${type}":`,
        error
      );
      return `Ocorreu um erro ao tentar enviar a imagem da grade "${type}".`;
    }
  },
};

export default gradeCommand;
