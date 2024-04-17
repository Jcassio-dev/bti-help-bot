const commands = require('./commands');

module.exports = (client) => {
    client.on('message', async (msg) => {
        const {body} = msg;
        const normalizedBody = body.split(" ")[0]?.toString().toLowerCase();
        const command = commands[normalizedBody];

        body === '!help' 
        ? await msg.reply(`Comandos disponíveis:\n${Object.keys(commands).sort((a,b) => a-b).join('\n')}`)
        : command && await command(msg, client);
    });
};