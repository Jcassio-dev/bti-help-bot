import { test } from "node:test";
import assert from "node:assert/strict";
import { extractMessageText } from "./message-parser";

test("extractMessageText retorna o texto de conversation", () => {
  const result = extractMessageText({ conversation: "!ping" });
  assert.equal(result, "!ping");
});

test("extractMessageText retorna o texto de extendedTextMessage", () => {
  const result = extractMessageText({
    extendedTextMessage: { text: "!menu" },
  });
  assert.equal(result, "!menu");
});

test("extractMessageText retorna a legenda de uma imagem", () => {
  const result = extractMessageText({
    imageMessage: { caption: "!figurinha" },
  });
  assert.equal(result, "!figurinha");
});

test("extractMessageText retorna a legenda de um vídeo", () => {
  const result = extractMessageText({
    videoMessage: { caption: "!figurinha" },
  });
  assert.equal(result, "!figurinha");
});

test("extractMessageText retorna undefined quando não há texto nem legenda", () => {
  const result = extractMessageText({ imageMessage: {} });
  assert.equal(result, undefined);
});

test("extractMessageText retorna undefined para mensagem nula", () => {
  assert.equal(extractMessageText(null), undefined);
  assert.equal(extractMessageText(undefined), undefined);
});
