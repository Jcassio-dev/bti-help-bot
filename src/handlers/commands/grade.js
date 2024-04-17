const { MessageMedia } = require('whatsapp-web.js');

module.exports = async (msg, client) => {
  const grades = {
   noturno: {path: "./src/content/imgs/grade-geral.jpeg", caption: "Essa é a grade Geral do Noturno."},
   integral: {path: "./src/content/imgs/grade-geral-i.jpeg", caption: "Essa é a grade Geral do Integral."}, 
   cc:  {path: "./src/content/imgs/grade-cc.jpeg", caption: "Essa é a grade da enfase em Ciência da Computação."},
   es: {path: "./src/content/imgs/grade-es.jpeg", caption: "Essa é a grade da enfase em Engenharia de Software."},
  }

  const type = msg.body.split(" ")[1]?.toString().toLowerCase();

  if(msg.body === "!grade" || !grades[type]) {
   return await msg.reply(`Tente: !grade <nome-da-grade>\nDisponíveis:\n${Object.keys(grades).join("\n")}`);
  }

  const chatId = msg.from;
    
  const imagePath = grades[type]?.path;
  const image = MessageMedia.fromFilePath(imagePath);

  client.sendMessage(chatId, image, { caption: grades[type]?.caption});
 }