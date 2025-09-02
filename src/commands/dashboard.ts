import { AnyMessageContent } from "baileys";
import { Command } from "../types/command";

const dashboardCommand: Command = {
  name: "dashboard",
  description: "Retorna o link para o painel geral do bot.",
  aliases: ["painel", "dash"],
  privateRestricted: false,
  loggable: false,
  execute: async (
    _sock,
    _msg,
    _args
  ): Promise<AnyMessageContent | string | null | undefined> => {
    return `Para ver o uso geral do bot acesse: https://bti-hp-dashboard.vercel.app/`;
  },
};

export default dashboardCommand;
