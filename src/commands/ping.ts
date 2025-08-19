import { WAMessage, WASocket } from "baileys";
import { Command } from "../types/command";

const pingCommand: Command = {
  name: "ping",
  description: "Responde com Pong!",
  aliases: ["p"],
  execute: async () => "Pong!",
  privateRestricted: false,
  loggable: true,
};

export default pingCommand;
