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
  MAX_VIDEO_SECONDS,
} from "./sticker.service";

const fixturesDir = path.join(
  os.tmpdir(),
  `figurinha-fixtures-${randomUUID()}`
);

let imageFixture: Buffer;
let videoFixture: Buffer;
let oversizedVideoFixture: Buffer;
let longVideoFixture: Buffer;

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

  // Mais longo que o limite de duração do comando: usado pra garantir que o
  // próprio ffmpeg corta em MAX_VIDEO_SECONDS, não só a checagem que o
  // comando faz antes de baixar a mídia (defesa em profundidade contra um
  // metadado "seconds" ausente ou forjado).
  const longPath = path.join(fixturesDir, "long.mp4");
  await generateFixture(
    ["-f", "lavfi", "-i", "testsrc=size=320x240:rate=15", "-t", "15"],
    longPath
  );
  longVideoFixture = await fs.readFile(longPath);
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

test("convertImageToSticker preenche as bordas com padding transparente, nao preto opaco", async () => {
  const sticker = await convertImageToSticker(imageFixture);
  const img = new Image();
  await img.load(sticker);
  assert.ok(
    img.hasAlpha,
    "imagem nao-quadrada preenchida (padding) precisa ter canal alpha"
  );
});

test("convertVideoToSticker preenche as bordas com padding transparente, nao preto opaco", async () => {
  const sticker = await convertVideoToSticker(videoFixture);
  const img = new Image();
  await img.load(sticker);
  assert.ok(
    img.hasAlpha,
    "video nao-quadrado preenchido (padding) precisa ter canal alpha"
  );
});

test("convertImageToSticker produz um cabecalho RIFF com o tamanho correto", async () => {
  const sticker = await convertImageToSticker(imageFixture);
  const declaredSize = sticker.readUInt32LE(4);
  assert.equal(
    declaredSize,
    sticker.length - 8,
    "ffmpeg nao pode deixar o campo de tamanho do RIFF zerado/errado (acontece quando a saida vai por um pipe nao-seekable); " +
      "alguns parsers de webp toleram isso, outros nao — o arquivo precisa ser valido de verdade"
  );
});

test("convertVideoToSticker produz um cabecalho RIFF com o tamanho correto", async () => {
  const sticker = await convertVideoToSticker(videoFixture);
  const declaredSize = sticker.readUInt32LE(4);
  assert.equal(
    declaredSize,
    sticker.length - 8,
    "ffmpeg nao pode deixar o campo de tamanho do RIFF zerado/errado (acontece quando a saida vai por um pipe nao-seekable); " +
      "alguns parsers de webp toleram isso, outros nao — o arquivo precisa ser valido de verdade"
  );
});

test("convertVideoToSticker corta a saida no limite mesmo se a entrada for mais longa", async () => {
  const sticker = await convertVideoToSticker(longVideoFixture);
  const img = new Image();
  await img.load(sticker);
  const maxFrames = MAX_VIDEO_SECONDS * 10; // 10fps de saida
  assert.ok(
    (img.frameCount ?? 0) <= maxFrames + 2,
    `esperava no maximo ~${maxFrames} frames (${MAX_VIDEO_SECONDS}s a 10fps), recebeu ${img.frameCount}`
  );
});

test("convertImageToSticker rejeita se o ffmpeg exceder o tempo limite", async () => {
  await assert.rejects(
    () => convertImageToSticker(imageFixture, 1),
    /tempo limite/
  );
});

test("convertVideoToSticker rejeita se o ffmpeg exceder o tempo limite", async () => {
  await assert.rejects(
    () => convertVideoToSticker(videoFixture, 1),
    /tempo limite/
  );
});
