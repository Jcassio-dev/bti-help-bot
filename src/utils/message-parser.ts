const commandPrefix = "!";

export interface ParsedMessage {
  commandName: string;
  args: string[];
  isCommand: boolean;
}

export function parseMessage(messageContent: string): ParsedMessage {
  if (!messageContent || !messageContent.startsWith(commandPrefix)) {
    return { commandName: "", args: [], isCommand: false };
  }

  const args = messageContent.slice(commandPrefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase() || "";

  return {
    commandName,
    args,
    isCommand: true,
  };
}
