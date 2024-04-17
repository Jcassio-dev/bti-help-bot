module.exports = async (msg) => {
  const { editais } = global.appContext;

  if (!editais || !editais.length) {
    await msg.reply(
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

  await msg.reply(message);
};
