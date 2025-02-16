const fs = require("fs");
const path = require("path");

module.exports = async (msg, client) => {
  const chatId = msg.from;
  const pdfPath = path.resolve(
    __dirname,
    "../../content/docs/calendario2025.pdf"
  );
  const pdfData = fs.readFileSync(pdfPath).toString("base64");
  const pdfBase64 = `data:application/pdf;base64,${pdfData}`;

  client.sendFile(
    chatId,
    pdfBase64,
    "calendario2025.pdf",
    "Esse é o calendário referente ao ano de 2025."
  );
};
