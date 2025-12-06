import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "baileys";
import { Boom } from "@hapi/boom";
import * as path from "path";
import { handleMessages } from "./handlers";
import * as qrcode from "qrcode-terminal";
import P from "pino";
import { CommandFactory } from "../factories/command.factory";

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
    browser: ["BTI Help Bot", "Chrome", "1.0.0"],
  });

  const commandFactory = new CommandFactory();
  await commandFactory.loadCommands();
  console.log("[BOT] Comandos carregados com sucesso.");

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("QR Code recebido, escaneie por favor:");
      console.log("QR Code String", qr);
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect?.error,
        ", reconnecting ",
        shouldReconnect
      );
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
      handleMessages(sock, undefined, undefined, commandFactory);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}
