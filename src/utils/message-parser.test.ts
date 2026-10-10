import { test } from "node:test";
import assert from "node:assert/strict";
import { extractMessageText, extractCommandKey } from "./message-parser";

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

test("extractCommandKey reconhece o nome do comando em minusculas", () => {
  assert.equal(extractCommandKey({ conversation: "!FIGURINHA" }), "figurinha");
});

test("extractCommandKey reconhece comando vindo de legenda de midia", () => {
  assert.equal(
    extractCommandKey({ imageMessage: { caption: "!figurinha" } }),
    "figurinha"
  );
});

test("extractCommandKey retorna 'unknown' quando nao ha texto nem legenda", () => {
  assert.equal(extractCommandKey({}), "unknown");
});

test("extractCommandKey retorna 'unknown' para texto que nao comeca com !", () => {
  assert.equal(extractCommandKey({ conversation: "oi gente" }), "unknown");
});
