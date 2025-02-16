module.exports = async (msg, client) => {
  await client.sendText(msg.from, "Pong!");
};
