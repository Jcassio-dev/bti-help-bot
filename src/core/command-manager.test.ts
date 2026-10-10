import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { CommandManager } from "./command-manager";
import { logger } from "../services/logger.service";

test("loadCommands ignora arquivos de teste no diretorio de comandos", async () => {
  const warn = mock.method(logger, "warn");
  try {
    await CommandManager.getInstance().loadCommands();
    const warnedAboutTestFile = warn.mock.calls.some((call) =>
      JSON.stringify(call.arguments).includes(".test.")
    );
    assert.equal(
      warnedAboutTestFile,
      false,
      "um arquivo .test.ts no diretorio de comandos nao deveria ser carregado nem gerar aviso"
    );
  } finally {
    warn.mock.restore();
  }
});
