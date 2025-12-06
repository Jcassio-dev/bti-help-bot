import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "baileys";
import { Boom } from "@hapi/boom";
import * as path from "path";
import { handleMessages } from "./handlers";
import * as qrcode from "qrcode-terminal";
import P from "pino";
import { CommandFactory } from "../factories/command.factory";
import { logger } from "../services/logger.service";

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "..", "auth_info_baileys")
  );
  const sock = makeWASocket({
    auth: state,
    logger: P({
      level: "info",
    }),
    syncFullHistory: false,
    markOnlineOnConnect: true,
    enableRecentMessageCache: true,
    
    browser: ["BTI Help Bot", "Chrome", "1.0.0"],
  });

  const commandFactory = new CommandFactory();
  await commandFactory.loadCommands();
  logger.info("Comandos carregados com sucesso");

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      logger.info("QR Code recebido, escaneie por favor");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      logger.warn({
        error: lastDisconnect?.error,
        shouldReconnect
      }, "Conexão fechada");
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      logger.info("Conexão aberta com WhatsApp");
      handleMessages(sock, undefined, undefined, commandFactory);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}
