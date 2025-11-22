import { BaseCommand } from "../types/command";
import { WASocket, WAMessage, AnyMessageContent } from "baileys";

export default class SecretariaCommand extends BaseCommand {
  name = "secretaria";
  description = "Envia o contato da secretaria.";
  aliases = [];
  privateRestricted = false;
  loggable = true;

  async execute(
    sock: WASocket,
    msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "Email: secretaria-bti@imd.ufrn.br" },
      { quoted: msg }
    );

    const contactCard = `BEGIN:VCARD
VERSION:3.0
FN:Secretaria BTI
TEL;type=CELL;type=VOICE;waid=558492240012:+55 84 9224-0012
EMAIL:secretaria-bti@imd.ufrn.br
END:VCARD`;

    return {
      contacts: {
        displayName: "Secretaria BTI",
        contacts: [{ vcard: contactCard }],
      },
    };
  }
}
