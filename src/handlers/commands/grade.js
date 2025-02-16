const path = require("path");

module.exports = async (msg, client) => {
  const grades = {
    noturno: {
      path: "../../content/imgs/grade-geral.jpeg",
      filename: "grade-geral.jpeg",
      caption: "Essa é a grade Geral do Noturno.",
    },
    integral: {
      path: "../../content/imgs/grade-geral-i.jpeg",
      filename: "grade-geral-i.jpeg",
      caption: "Essa é a grade Geral do Integral.",
    },
    cc: {
      path: "../../content/imgs/grade-cc.jpeg",
      filename: "grade-cc.jpeg",
      caption: "Essa é a grade da enfase em Ciência da Computação.",
    },
    es: {
      path: "../../content/imgs/grade-es.jpeg",
      filename: "grade-es.jpeg",
      caption: "Essa é a grade da enfase em Engenharia de Software.",
    },
  };

  const type = msg.body.split(" ")[1]?.toString().toLowerCase();

  if (msg.body === "!grade" || !grades[type]) {
    return await client.sendText(
      msg.from,
      `Tente: !grade <nome-da-grade>\nDisponíveis:\n${Object.keys(grades).join(
        "\n"
      )}`
    );
  }

  const chatId = msg.from;

  const caption = grades[type].caption;
  const imagePath = path.resolve(__dirname, grades[type].path);
  const filename = grades[type].filename;

  client.sendImage(chatId, imagePath, filename, caption);
};
