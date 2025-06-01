import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "baileys";
import { Boom } from "@hapi/boom";
import * as path from "path";
import { handleMessages } from "./handlers";
import * as qrcode from "qrcode-terminal";

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "..", "auth_info_baileys")
  );
  const sock = makeWASocket({
    auth: state,
  });

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
      handleMessages(sock);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}
