import { WAMessage, WASocket, AnyMessageContent } from "baileys";
import { Command } from "../types/command";
import * as path from "path";
import * as fs from "fs";

const circularCommand: Command = {
  name: "circular",
  description: "Envia a imagem dos horários do circular.",
  aliases: ["circ", "onibus", "horariocircular"],
  privateRestricted: false,
  execute: async (
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> => {
    const imagePath = path.resolve(
      __dirname,
      "..",
      "resources",
      "imgs",
      "horarios-ufrn.jpeg"
    );

    try {
      if (!fs.existsSync(imagePath)) {
        console.error(
          "Arquivo de imagem do circular não encontrado:",
          imagePath
        );
        return "Desculpe, não consegui encontrar a imagem dos horários do circular no momento.";
      }

      const imageBuffer = fs.readFileSync(imagePath);

      const messageToSend: AnyMessageContent = {
        image: imageBuffer,
        caption: "Esses são os horários do circular.",
      };
      return messageToSend;
    } catch (error) {
      console.error("Erro ao ler ou preparar a imagem do circular:", error);
      return "Ocorreu um erro ao tentar enviar a imagem dos horários do circular.";
    }
  },
};

export default circularCommand;
