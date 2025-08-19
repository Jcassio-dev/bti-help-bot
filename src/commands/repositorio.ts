import { WAMessage, WASocket } from "baileys";
import { Command } from "../types/command";

const pingCommand: Command = {
  name: "repositorio",
  description: "Manda o link do repositório do bot",
  aliases: ["repo", "github", "source", "sourcecode", "code", "codigo", "star"],
  privateRestricted: false,
  execute: async () =>
    "Você pode encontrar e colaborar com o meu código no seguinte repositório:\nhttps://github.com/Jcassio-dev/bti-help-bot",
  loggable: true,
};

export default pingCommand;
