import { WAMessage, WASocket, AnyMessageContent } from "baileys";
import { Command } from "../types/command";
import * as path from "path";
import * as fs from "fs";

const calendarioCommand: Command = {
  name: "calendario",
  description: "Envia a imagem dos horários do circular.",
  aliases: ["cal", "acad"],
  privateRestricted: false,
  execute: async (
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> => {
    const docPath = path.resolve(
      __dirname,
      "..",
      "resources",
      "docs",
      "calendario2025.pdf"
    );

    try {
      if (!fs.existsSync(docPath)) {
        console.error("Arquivo do calendario não encontrado:", docPath);
        return "Desculpe, não consegui encontrar o arquivo do calendário no momento.";
      }

      const pdfBuffer = fs.readFileSync(docPath);

      const messageToSend: AnyMessageContent = {
        document: pdfBuffer,
        mimetype: "application/pdf",
        fileName: "calendario2025.pdf",
        caption: "Aqui está o calendário do ano letivo de 2025.",
      };
      return messageToSend;
    } catch (error) {
      console.error("Erro ao ler ou preparar o pdf do calendário:", error);
      return "Desculpe, ocorreu um erro ao tentar enviar o calendário. Por favor, tente novamente mais tarde.";
    }
  },
};

export default calendarioCommand;
