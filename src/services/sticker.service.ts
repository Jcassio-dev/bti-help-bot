import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";
import { randomUUID } from "crypto";
import { Image } from "node-webpmux";

export const MAX_STICKER_BYTES = 1_000_000;
export const MAX_VIDEO_SECONDS = 10;

const STICKER_SIZE = 512;
const PAD_FILTER = `scale=${STICKER_SIZE}:${STICKER_SIZE}:force_original_aspect_ratio=decrease,pad=${STICKER_SIZE}:${STICKER_SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba`;
const DEFAULT_FFMPEG_TIMEOUT_MS = 30_000;
// Checked while ffmpeg is still running, against a file it's still writing —
// generous on purpose so a legitimate near-the-edge encode isn't killed
// mid-flight; assertWithinSizeLimit() does the exact, final check once
// ffmpeg is done.
const MAX_FFMPEG_OUTPUT_BYTES = MAX_STICKER_BYTES * 2;
const OUTPUT_SIZE_POLL_INTERVAL_MS = 250;

export class StickerTooLargeError extends Error {
  constructor(public readonly actualBytes: number) {
    super(`Figurinha gerada ficou grande demais: ${actualBytes} bytes`);
  }
}

async function runFfmpeg(
  input: Buffer,
  buildArgs: (inputPath: string, outputPath: string) => string[],
  timeoutMs: number = DEFAULT_FFMPEG_TIMEOUT_MS
): Promise<Buffer> {
  const tmpInputPath = path.join(os.tmpdir(), `figurinha-${randomUUID()}.input`);
  // The output also goes to a real file, not a pipe: ffmpeg's webp muxer
  // patches the RIFF chunk's size field by seeking back after writing all
  // the data, which a pipe can't do — piping leaves that field zeroed.
  // Some webp parsers tolerate that (observed on Node 24), others don't
  // (observed on Node 20, the Docker image's version), so the fix is to
  // never produce a mis-sized RIFF header in the first place.
  const tmpOutputPath = path.join(os.tmpdir(), `figurinha-${randomUUID()}.webp`);
  await fs.writeFile(tmpInputPath, input);

  let sizePoll: NodeJS.Timeout | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("ffmpeg", buildArgs(tmpInputPath, tmpOutputPath));
      const stderr: Buffer[] = [];
      let settled = false;

      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearInterval(sizePoll);
        fn();
      };

      const timer = setTimeout(() => {
        settle(() => {
          proc.kill("SIGKILL");
          reject(new Error(`ffmpeg excedeu o tempo limite de ${timeoutMs}ms`));
        });
      }, timeoutMs);

      // ffmpeg writes its output straight to tmpOutputPath, so this is the
      // only way to notice a runaway encode (unusually long/complex input)
      // before it finishes — killing it early instead of letting it finish
      // and then throwing the same error after the work is already done.
      sizePoll = setInterval(() => {
        fs.stat(tmpOutputPath)
          .then((stat) => {
            if (stat.size > MAX_FFMPEG_OUTPUT_BYTES) {
              settle(() => {
                proc.kill("SIGKILL");
                reject(new StickerTooLargeError(stat.size));
              });
            }
          })
          .catch(() => {
            // output file doesn't exist yet — nothing to check.
          });
      }, OUTPUT_SIZE_POLL_INTERVAL_MS);

      proc.stderr.on("data", (chunk) => stderr.push(chunk));
      proc.on("error", (err) => settle(() => reject(err)));
      proc.on("close", (code) => {
        settle(() => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(
                `ffmpeg saiu com código ${code}: ${Buffer.concat(
                  stderr
                ).toString("utf-8")}`
              )
            );
          }
        });
      });
    });
    return await fs.readFile(tmpOutputPath);
  } finally {
    clearInterval(sizePoll);
    await fs.unlink(tmpInputPath).catch(() => {});
    await fs.unlink(tmpOutputPath).catch(() => {});
  }
}

const VP8X_FOURCC_OFFSET = 12;
const VP8X_FLAGS_OFFSET = 20;
const VP8X_ALPHA_BIT = 0x10;

// node-webpmux's save() recomputes the VP8X "has alpha" flag from
// this.data.alph / this.data.vp8l.alpha, which only exist for single-frame
// images. For an animation the real alpha lives per frame, so save() always
// clears this bit even when every frame has alpha — as ours always do,
// since ffmpeg is told to encode yuva420p. Force the bit back on so
// compliant decoders don't ignore the frames' alpha.
function forceVp8xAlphaFlag(webpBuffer: Buffer): Buffer {
  const isExtendedFormat =
    webpBuffer
      .subarray(VP8X_FOURCC_OFFSET, VP8X_FOURCC_OFFSET + 4)
      .toString("ascii") === "VP8X";
  if (isExtendedFormat) {
    webpBuffer[VP8X_FLAGS_OFFSET] |= VP8X_ALPHA_BIT;
  }
  return webpBuffer;
}

async function applyStickerExif(webpBuffer: Buffer): Promise<Buffer> {
  const img = new Image();
  await img.load(webpBuffer);

  const stickerPackJson = {
    "sticker-pack-id": "figurinha-bot",
    "sticker-pack-name": "Figurinhas",
    "sticker-pack-publisher": "",
    emojis: [] as string[],
  };
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonBuffer = Buffer.from(JSON.stringify(stickerPackJson), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);

  img.exif = exif;
  const saved = await img.save(null);
  return forceVp8xAlphaFlag(saved);
}

function assertWithinSizeLimit(buffer: Buffer): void {
  if (buffer.length > MAX_STICKER_BYTES) {
    throw new StickerTooLargeError(buffer.length);
  }
}

export async function convertImageToSticker(
  input: Buffer,
  timeoutMs?: number
): Promise<Buffer> {
  const webp = await runFfmpeg(
    input,
    (inputPath, outputPath) => [
      "-i",
      inputPath,
      "-vf",
      PAD_FILTER,
      "-vcodec",
      "libwebp",
      "-pix_fmt",
      "yuva420p",
      "-f",
      "webp",
      outputPath,
    ],
    timeoutMs
  );
  const withExif = await applyStickerExif(webp);
  assertWithinSizeLimit(withExif);
  return withExif;
}

export async function convertVideoToSticker(
  input: Buffer,
  timeoutMs?: number
): Promise<Buffer> {
  const webp = await runFfmpeg(
    input,
    (inputPath, outputPath) => [
      "-i",
      inputPath,
      "-t",
      String(MAX_VIDEO_SECONDS),
      "-vf",
      `fps=10,${PAD_FILTER}`,
      "-vcodec",
      "libwebp",
      "-pix_fmt",
      "yuva420p",
      "-lossless",
      "0",
      "-q:v",
      "50",
      "-loop",
      "0",
      "-preset",
      "default",
      "-an",
      "-f",
      "webp",
      outputPath,
    ],
    timeoutMs
  );
  const withExif = await applyStickerExif(webp);
  assertWithinSizeLimit(withExif);
  return withExif;
}
