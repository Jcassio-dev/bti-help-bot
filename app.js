const wppconnect = require("@wppconnect-team/wppconnect");
const schedule = require("node-schedule");
const puppeteer = require("puppeteer");

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
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  .then((client) => {
    console.log("Client is ready!");

    makeScrapping();

    schedule.scheduleJob("0 */5 * * *", function () {
      makeScrapping();
    });

    messageHandler(client);
  })
  .catch((err) => {
    console.error("Error during client initialization", err);
  });
