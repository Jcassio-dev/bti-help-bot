import { test } from "node:test";
import assert from "node:assert/strict";
import { WAMessage, WASocket } from "baileys";
import FigurinhaCommand, { detectMedia, downloadWithRetry } from "./figurinha";

test("detectMedia retorna null quando não há mídia", () => {
  const msg = { message: {} } as WAMessage;
  assert.equal(detectMedia(msg), null);
});

test("detectMedia reconhece imagem", () => {
  const msg = { message: { imageMessage: {} } } as WAMessage;
  assert.deepEqual(detectMedia(msg), { type: "image" });
});

test("detectMedia reconhece vídeo com duração", () => {
  const msg = {
    message: { videoMessage: { seconds: 7 } },
  } as WAMessage;
  assert.deepEqual(detectMedia(msg), { type: "video", durationSeconds: 7 });
});

test("detectMedia reconhece vídeo sem duração informada", () => {
  const msg = { message: { videoMessage: {} } } as WAMessage;
  assert.deepEqual(detectMedia(msg), {
    type: "video",
    durationSeconds: undefined,
  });
});

test("execute retorna texto de uso quando não há mídia anexada", async () => {
  const cmd = new FigurinhaCommand();
  const msg = { message: {} } as WAMessage;
  const result = await cmd.execute({} as WASocket, msg, []);
  assert.equal(
    result,
    "Envie uma foto, vídeo ou gif com a legenda !figurinha."
  );
});

test("execute rejeita vídeo acima do limite sem tentar baixar nada", async () => {
  const cmd = new FigurinhaCommand();
  const msg = {
    message: { videoMessage: { seconds: 15 } },
  } as WAMessage;
  const result = await cmd.execute({} as WASocket, msg, []);
  assert.equal(result, "O vídeo precisa ter no máximo 10 segundos.");
});

test("downloadWithRetry retorna o resultado de primeira se nao falhar", async () => {
  let calls = 0;
  const result = await downloadWithRetry(async () => {
    calls++;
    return "ok";
  });
  assert.equal(result, "ok");
  assert.equal(calls, 1);
});

test("downloadWithRetry tenta de novo apos uma falha e eventualmente funciona", async () => {
  let calls = 0;
  const result = await downloadWithRetry(
    async () => {
      calls++;
      if (calls < 2) throw new Error("bad decrypt");
      return "ok";
    },
    3,
    0
  );
  assert.equal(result, "ok");
  assert.equal(calls, 2);
});

test("downloadWithRetry esgota as tentativas e lanca o ultimo erro", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      downloadWithRetry(
        async () => {
          calls++;
          throw new Error(`falha ${calls}`);
        },
        3,
        0
      ),
    /falha 3/
  );
  assert.equal(calls, 3);
});
