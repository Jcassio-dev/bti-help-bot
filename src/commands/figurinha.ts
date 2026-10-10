import {
  AnyMessageContent,
  WAMessage,
  WASocket,
  downloadMediaMessage,
} from "baileys";
import { BaseCommand } from "../types/command";
import {
  convertImageToSticker,
  convertVideoToSticker,
  StickerTooLargeError,
  MAX_VIDEO_SECONDS,
} from "../services/sticker.service";
import { logger } from "../services/logger.service";

export interface DetectedMedia {
  type: "image" | "video";
  durationSeconds?: number;
}

export function detectMedia(msg: WAMessage): DetectedMedia | null {
  if (msg.message?.imageMessage) {
    return { type: "image" };
  }

  if (msg.message?.videoMessage) {
    return {
      type: "video",
      durationSeconds: msg.message.videoMessage.seconds ?? undefined,
    };
  }

  return null;
}

export default class FigurinhaCommand extends BaseCommand {
  name = "figurinha";
  description = "Transforma foto, vídeo ou gif (na legenda) em figurinha.";
  aliases = ["sticker", "fig"];
  privateRestricted = true;
  loggable = false;

  async execute(
    sock: WASocket,
    msg: WAMessage,
    _args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> {
    const media = detectMedia(msg);

    if (!media) {
      return "Envie uma foto, vídeo ou gif com a legenda !figurinha.";
    }

    if (
      media.type === "video" &&
      (media.durationSeconds ?? 0) > MAX_VIDEO_SECONDS
    ) {
      return `O vídeo precisa ter no máximo ${MAX_VIDEO_SECONDS} segundos.`;
    }

    try {
      const buffer = await downloadMediaMessage(
        msg,
        "buffer",
        {},
        {
          logger: logger.getRawLogger(),
          reuploadRequest: sock.updateMediaMessage,
        }
      );

      const stickerBuffer =
        media.type === "image"
          ? await convertImageToSticker(buffer)
          : await convertVideoToSticker(buffer);

      return { sticker: stickerBuffer };
    } catch (error) {
      if (error instanceof StickerTooLargeError) {
        return "O resultado ficou grande demais para enviar como figurinha. Tenta um vídeo mais curto ou mais simples.";
      }
      logger.error({ error }, "Erro ao gerar figurinha");
      return "Ocorreu um erro ao tentar gerar a figurinha.";
    }
  }
}
