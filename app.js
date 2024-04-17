const { Client, LocalAuth } = require("whatsapp-web.js");

const schedule = require("node-schedule");
const qrcode = require("qrcode-terminal");

const messageHandler = require("./src/handlers/messageHandler");
const makeScrapping = require("./src/scrappings");

global.appContext = {
  ruCardapio: [],
  editais: [],
  jobs: [],
};

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "sessions",
  }),
  puppeteer: {
    args: ["--no-sandbox"],
  },
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");

  makeScrapping();

  const job = schedule.scheduleJob("0 30 10 * *", function () {
    console.log("Enviando mensagem programada...");
    const chatId = "120363043647004147@g.us";
    client.sendMessage(chatId, ".:");
  });

  schedule.scheduleJob("0 */5 * * *", function () {
    makeScrapping();
  });

  messageHandler(client);
});

client.initialize();
