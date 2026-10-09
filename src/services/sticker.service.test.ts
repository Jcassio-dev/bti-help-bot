import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";
import { randomUUID } from "crypto";
import { Image } from "node-webpmux";
import {
  convertImageToSticker,
  convertVideoToSticker,
  StickerTooLargeError,
  MAX_STICKER_BYTES,
} from "./sticker.service";

const fixturesDir = path.join(
  os.tmpdir(),
  `figurinha-fixtures-${randomUUID()}`
);

let imageFixture: Buffer;
let videoFixture: Buffer;
let oversizedVideoFixture: Buffer;

function generateFixture(lavfiArgs: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [...lavfiArgs, "-y", outputPath]);
    const stderr: Buffer[] = [];
    proc.stderr.on("data", (chunk) => stderr.push(chunk));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `ffmpeg saiu com código ${code}: ${Buffer.concat(stderr).toString(
              "utf-8"
            )}`
          )
        );
    });
  });
}

before(async () => {
  await fs.mkdir(fixturesDir, { recursive: true });

  const imagePath = path.join(fixturesDir, "image.jpg");
  await generateFixture(
    ["-f", "lavfi", "-i", "color=c=red:s=320x240", "-frames:v", "1"],
    imagePath
  );
  imageFixture = await fs.readFile(imagePath);

  const videoPath = path.join(fixturesDir, "video.mp4");
  await generateFixture(
    ["-f", "lavfi", "-i", "testsrc=size=320x240:rate=15", "-t", "3"],
    videoPath
  );
  videoFixture = await fs.readFile(videoPath);

  // Conteúdo "ruidoso" (sem compressão redutível) por 10s: estressa o
  // encoder de propósito pra passar do limite de 1MB mesmo dentro do
  // limite de duração, e também reproduz o caso de mp4 que falha se
  // passado por stdin em vez de arquivo.
  const oversizedPath = path.join(fixturesDir, "oversized.mp4");
  await generateFixture(
    [
      "-f",
      "lavfi",
      "-i",
      "nullsrc=size=320x240:rate=15,geq=random(1)*255:128:128",
      "-t",
      "10",
    ],
    oversizedPath
  );
  oversizedVideoFixture = await fs.readFile(oversizedPath);
});

after(async () => {
  await fs.rm(fixturesDir, { recursive: true, force: true });
});

test("convertImageToSticker produz um webp estático dentro do limite", async () => {
  const sticker = await convertImageToSticker(imageFixture);
  assert.ok(sticker.length > 0);
  assert.ok(sticker.length < MAX_STICKER_BYTES);
  assert.equal(sticker.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(sticker.subarray(8, 12).toString("ascii"), "WEBP");
});

test("convertImageToSticker grava o nome do pack no EXIF", async () => {
  const sticker = await convertImageToSticker(imageFixture);
  const img = new Image();
  await img.load(sticker);
  assert.ok(img.exif);
  const json = img.exif!.subarray(22).toString("utf-8");
  assert.match(json, /"sticker-pack-name":"Figurinhas"/);
});

test("convertVideoToSticker produz um webp animado dentro do limite", async () => {
  const sticker = await convertVideoToSticker(videoFixture);
  assert.ok(sticker.length > 0);
  assert.ok(sticker.length < MAX_STICKER_BYTES);
  assert.equal(sticker.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(sticker.subarray(8, 12).toString("ascii"), "WEBP");
});

test("convertVideoToSticker rejeita um resultado grande demais", async () => {
  await assert.rejects(
    () => convertVideoToSticker(oversizedVideoFixture),
    StickerTooLargeError
  );
});
