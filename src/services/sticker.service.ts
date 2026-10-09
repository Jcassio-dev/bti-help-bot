import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";
import { randomUUID } from "crypto";
import { Image } from "node-webpmux";

export const MAX_STICKER_BYTES = 1_000_000;

const STICKER_SIZE = 512;
const PAD_FILTER = `scale=${STICKER_SIZE}:${STICKER_SIZE}:force_original_aspect_ratio=decrease,pad=${STICKER_SIZE}:${STICKER_SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`;

export class StickerTooLargeError extends Error {
  constructor(public readonly actualBytes: number) {
    super(`Figurinha gerada ficou grande demais: ${actualBytes} bytes`);
  }
}

async function runFfmpeg(
  input: Buffer,
  buildArgs: (inputPath: string) => string[]
): Promise<Buffer> {
  const tmpInputPath = path.join(os.tmpdir(), `figurinha-${randomUUID()}.input`);
  await fs.writeFile(tmpInputPath, input);

  try {
    return await new Promise<Buffer>((resolve, reject) => {
      const proc = spawn("ffmpeg", buildArgs(tmpInputPath));
      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];

      proc.stdout.on("data", (chunk) => stdout.push(chunk));
      proc.stderr.on("data", (chunk) => stderr.push(chunk));
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) {
          resolve(Buffer.concat(stdout));
        } else {
          reject(
            new Error(
              `ffmpeg saiu com código ${code}: ${Buffer.concat(stderr).toString(
                "utf-8"
              )}`
            )
          );
        }
      });
    });
  } finally {
    await fs.unlink(tmpInputPath).catch(() => {});
  }
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
  return img.save(null);
}

function assertWithinSizeLimit(buffer: Buffer): void {
  if (buffer.length > MAX_STICKER_BYTES) {
    throw new StickerTooLargeError(buffer.length);
  }
}

export async function convertImageToSticker(input: Buffer): Promise<Buffer> {
  const webp = await runFfmpeg(input, (inputPath) => [
    "-i",
    inputPath,
    "-vf",
    PAD_FILTER,
    "-f",
    "webp",
    "pipe:1",
  ]);
  const withExif = await applyStickerExif(webp);
  assertWithinSizeLimit(withExif);
  return withExif;
}

export async function convertVideoToSticker(input: Buffer): Promise<Buffer> {
  const webp = await runFfmpeg(input, (inputPath) => [
    "-i",
    inputPath,
    "-vf",
    `fps=10,${PAD_FILTER}`,
    "-vcodec",
    "libwebp",
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
    "pipe:1",
  ]);
  const withExif = await applyStickerExif(webp);
  assertWithinSizeLimit(withExif);
  return withExif;
}
