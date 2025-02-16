const wppconnect = require("@wppconnect-team/wppconnect");
const schedule = require("node-schedule");

const messageHandler = require("./src/handlers/messageHandler");
const makeScrapping = require("./src/scrappings");

global.appContext = {
  ruCardapio: [],
  editais: [],
  jobs: [],
};

wppconnect
  .create({
    session: "bot",
    logQR: true,
    autoClose: 60000,
    disableSpins: true,
    headless: true,
    useChrome: true,
    executablePath:
      "/opt/render/.cache/puppeteer/chrome/linux-123.0.6312.86/chrome-linux64/chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  .then((client) => {
    console.log("Client is ready!");

    makeScrapping();

    schedule.scheduleJob("0 30 10 * *", function () {
      console.log("Enviando mensagem programada...");
      const chatId = "120363043647004147@g.us";
      client.sendText(msg.from, chatId, ".:");
    });

    schedule.scheduleJob("0 */5 * * *", function () {
      makeScrapping();
    });

    messageHandler(client);
  })
  .catch((err) => {
    console.error("Error during client initialization", err);
  });
