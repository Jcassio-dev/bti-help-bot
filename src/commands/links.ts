import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";

export default class LinksCommand extends BaseCommand {
  name = "links";
  description = "Retorna links relacionados à comunidade do BTI";
  aliases = ["link", "comunidade", "grupo"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    return `Aqui estão alguns links úteis relacionados à comunidade do BTI:

*Comunidade do BTI*: https://chat.whatsapp.com/JdQxMkPs8ZYKg8kFPlXZ8U?mode=ems_copy_t
*Grupo de estudos*: https://chat.whatsapp.com/LYIeU3U0T8Z04njekhjalN
*Portal IMD*: https://www.metropoledigital.ufrn.br/portal/
    `;
  }
}
