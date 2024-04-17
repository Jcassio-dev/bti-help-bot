const { MessageMedia } = require('whatsapp-web.js');

module.exports = async (msg, client) => {
    const chatId = msg.from;
    
    const imagePath = './src/content/imgs/horarios-ufrn.jpeg'
    const image = MessageMedia.fromFilePath(imagePath);

    client.sendMessage(chatId, image, { caption: 'Esses são os horários do circular.' });
}