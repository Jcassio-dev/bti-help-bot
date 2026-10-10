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

export function extractCommandKey(
  message: WAMessageContent | null | undefined
): string {
  const rawText = extractMessageText(message);
  if (!rawText) return "unknown";
  const match = rawText.match(/^!(\w+)/);
  return match ? match[1].toLowerCase() : "unknown";
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
