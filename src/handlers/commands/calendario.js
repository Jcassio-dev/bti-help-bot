const { MessageMedia } = require('whatsapp-web.js');

module.exports = async (msg, client) => {
    const chatId = msg.from;
    
    const pdfPath = './src/content/docs/calendario2024.pdf'
    const pdf = MessageMedia.fromFilePath(pdfPath);

    client.sendMessage(chatId, pdf, { caption: 'Esse é o calendário referente ao ano de 2024.' });
}