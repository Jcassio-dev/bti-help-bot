import { AnyMessageContent } from "baileys";
import { Command } from "../types/command";

const linksCommand: Command = {
  name: "links",
  description: "Retorna links relacionados à comunidade do BTI",
  aliases: ["link", "comunidade", "grupo"],
  privateRestricted: false,
  loggable: true,
  execute: async (
    _sock,
    _msg,
    _args
  ): Promise<AnyMessageContent | string | null | undefined> => {
    return `Aqui estão alguns links úteis relacionados à comunidade do BTI:
    
*Comunidade do BTI*: https://chat.whatsapp.com/JdQxMkPs8ZYKg8kFPlXZ8U?mode=ems_copy_t
*Grupo de estudos*: https://chat.whatsapp.com/LYIeU3U0T8Z04njekhjalN
*Portal IMD*: https://www.metropoledigital.ufrn.br/portal/
    `;
  },
};

export default linksCommand;
