const get_random_word = require("../../util/words");
const days_until = require("../../util/data_calc");
const progressBar = require("../../util/progress_bar");

module.exports = async (msg, client) => {
  const passedDays = 180 - days_until("2024-07-06");
  await client.sendText(
    msg.from,
    "Faltam " +
      days_until("2024-07-06") +
      " " +
      get_random_word() +
      " dias para o fim do semestre\n" +
      progressBar(passedDays)
  );
};
