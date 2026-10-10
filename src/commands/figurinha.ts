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

const MAX_DOWNLOAD_RETRIES = 3;
const DOWNLOAD_RETRY_DELAY_MS = 1500;

// O download da mídia às vezes chega truncado (observado na prática:
// downloadMediaMessage falha com "bad decrypt" — o AES-CBC do Baileys só
// fecha o padding no fim do stream, então um corte de rede no meio do
// download quebra o último bloco). Vídeos maiores (ex: um vídeo salvo na
// galeria, reenviado) demoram mais pra baixar e dão mais chance disso
// acontecer; um vídeo gravado na hora, bem menor, quase nunca sofre esse
// problema. Tentar de novo resolve na prática.
export async function downloadWithRetry<T>(
  download: () => Promise<T>,
  maxRetries: number = MAX_DOWNLOAD_RETRIES,
  retryDelayMs: number = DOWNLOAD_RETRY_DELAY_MS
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await download();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        logger.warn(
          { error, attempt },
          "Falha ao baixar mídia da figurinha, tentando de novo"
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }
  throw lastError;
}

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
      const buffer = await downloadWithRetry(() =>
        downloadMediaMessage(
          msg,
          "buffer",
          {},
          {
            logger: logger.getRawLogger(),
            reuploadRequest: sock.updateMediaMessage,
          }
        )
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
      return "Ocorreu um erro ao tentar gerar a figurinha. Tenta de novo em alguns instantes.";
    }
  }
}
