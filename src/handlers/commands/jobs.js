function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

module.exports = async (msg, client) => {
  const { jobs } = global.appContext;

  if (!jobs || !jobs.length) {
    await client.sendText(
      msg.from,
      "Não foi possível buscar as vagas. Tente novamente mais tarde."
    );
    return;
  }

  let message = "Aqui estão as vagas que encontrei no Jerimum Jobs:\n\n";

  jobs.forEach((job) => {
    message += `*${job.title}* - _${formatDate(job.deadline)}_\n`;
    message += `*${job.company}* - _${job.area.join(", ")}_\n`;
    message += `${job.regime}, R$ ${job.salary || "Não informado"} \n`;
    message += `[Link da Vaga](${job.link})\n`;
    message += "\n";
  });

  await client.sendText(msg.from, message);
};
