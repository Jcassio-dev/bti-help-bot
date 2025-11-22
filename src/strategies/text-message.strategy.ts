import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { MessageStrategy } from "./message.strategy";

export class TextMessageStrategy implements MessageStrategy {
  async execute(
    sock: WASocket,
    jid: string,
    content: AnyMessageContent,
    quoted: WAMessage
  ): Promise<void> {
    await sock.sendMessage(jid, content, { quoted });
  }
}
