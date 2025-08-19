import { AnyMessageContent, WAMessage, WASocket } from "baileys";

export interface Command {
  name: string;
  description?: string;
  aliases?: string[];
  execute: (
    sock: WASocket,
    msg: WAMessage,
    args: string[],
    allCommands?: Map<string, Command>
  ) => Promise<AnyMessageContent | string | null | undefined>;
  adminOnly?: boolean;
  privateRestricted?: boolean;
  loggable?: boolean;
}
