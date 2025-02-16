const commands = require("./commands");

module.exports = (client) => {
  client.onMessage(async (msg) => {
    if (process.env.NODE_ENV === "development" && msg.from.endsWith("@g.us")) {
      return;
    }

    const { body, from } = msg;

    console.log(`Mensagem recebida de ${from}: ${body}`);
    const normalizedBody = body.split(" ")[0]?.toString().toLowerCase();
    const command = commands[normalizedBody];

    body === "!help"
      ? await client.sendText(
          from,
          `Comandos disponíveis:\n${Object.keys(commands)
            .sort((a, b) => a - b)
            .join("\n")}`
        )
      : command && (await command(msg, client));
  });
};
