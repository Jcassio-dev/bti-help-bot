module.exports = async (msg, client) => {
  await client.sendText(
    msg.from,
    "Você pode encontrar e colaborar com o meu código no seguinte repositório:\nhttps://github.com/Jcassio-dev/bti-help-bot"
  );
};
