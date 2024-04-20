const commands = require("./commands");

module.exports = (client) => {
  client.on("message", async (msg) => {
    if (process.env.NODE_ENV === "development" && msg.from.endsWith("@g.us")) {
      return;
    }

    const { body } = msg;
    const normalizedBody = body.split(" ")[0]?.toString().toLowerCase();
    const command = commands[normalizedBody];

    body === "!help"
      ? await msg.reply(
          `Comandos disponíveis:\n${Object.keys(commands)
            .sort((a, b) => a - b)
            .join("\n")}`
        )
      : command && (await command(msg, client));
  });
};
