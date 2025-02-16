const get_random_word = require("../../util/words");
const days_until = require("../../util/data_calc");
const progressBar = require("../../util/progress_bar");

module.exports = async (msg, client) => {
  const today = new Date();
  const daysToSemesterEnd = days_until("2025-08-08");

  await client.sendText(
    msg.from,
    "Faltam " +
      daysToSemesterEnd +
      " " +
      get_random_word() +
      " dias para o fim do semestre\n"
  );
};
