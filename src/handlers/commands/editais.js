module.exports = async (msg, client) => {
  const { editais } = global.appContext;

  if (!editais || !editais.length) {
    await client.sendText(
      msg.from,
      "Não foi possível buscar os editais. Tente novamente mais tarde."
    );
    return;
  }

  let message = "Aqui estão os editais que encontrei:\n\n";
  editais.forEach((edital) => {
    message += `*${edital.processo}* - _${edital.titulo}_\n`;
    message += `*Inscrição:* _${edital.inscricao}_\n`;
    message += `*Tipo:* _${edital.tipo}_\n`;
    message += `*Valor:* R$ ${edital.valor || "Não informado"}\n`;
    message += `[Link do Edital](${edital.link})\n`;
    message += "\n";
  });

  await client.sendText(msg.from, message);
};
