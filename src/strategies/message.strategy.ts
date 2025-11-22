import { AnyMessageContent, WAMessage, WASocket } from "baileys";

export interface MessageStrategy {
  execute(
    sock: WASocket,
    jid: string,
    content: AnyMessageContent,
    quoted: WAMessage
  ): Promise<void>;
}
