const path = require("path");

module.exports = async (msg, client) => {
  const chatId = msg.from;
  const imagePath = path.resolve(
    __dirname,
    "../../content/imgs/horarios-ufrn.jpeg"
  );

  client.sendImage(
    chatId,
    imagePath,
    "horarios-ufrn.jpeg",
    "Esses são os horários do circular."
  );
};
