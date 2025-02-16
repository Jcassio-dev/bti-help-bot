module.exports = async (msg, client) => {
  const chatId = msg.from;

  const pdfPath = "./src/content/docs/calendario2024.pdf";

  client.sendImage(chatId, pdfPath, {
    caption: "Esse é o calendário referente ao ano de 2024.",
  });
};
