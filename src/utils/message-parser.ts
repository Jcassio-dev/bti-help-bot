import { WAMessageContent } from "baileys";

const commandPrefix = "!";

export function extractMessageText(
  message: WAMessageContent | null | undefined
): string | undefined {
  if (!message) return undefined;
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    undefined
  );
}

export interface ParsedMessage {
  commandName: string;
  args: string[];
  isCommand: boolean;
}

export function parseMessage(messageContent: string): ParsedMessage {
  if (!messageContent || !messageContent.startsWith(commandPrefix)) {
    return { commandName: "", args: [], isCommand: false };
  }

  const args = messageContent.slice(commandPrefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase() || "";

  return {
    commandName,
    args,
    isCommand: true,
  };
}
