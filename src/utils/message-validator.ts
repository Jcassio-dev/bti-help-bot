import { WAMessage } from "baileys";
import { BaseCommand } from "../types/command";

export interface MessageValidationResult {
  isGroupMessage: boolean;
  finalReplyToJid: string;
  userId: string;
}

export function validateMessageContext(
  msg: WAMessage,
  command: BaseCommand
): MessageValidationResult {
  const isGroupMessage =
    !!msg.key.participant && msg.key.remoteJid?.endsWith("@g.us");

  const userId = msg.key.participant || msg.key.remoteJid!;

  const finalReplyToJid =
    isGroupMessage && command.privateRestricted
      ? msg.key.participant!
      : msg.key.remoteJid!;

  return {
    isGroupMessage,
    finalReplyToJid,
    userId,
  };
}
