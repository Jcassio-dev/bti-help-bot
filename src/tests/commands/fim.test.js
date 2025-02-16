const fim = require("../../handlers/commands/fim");
const days_until = require("../../util/data_calc");
const get_random_word = require("../../util/words");
const progressBar = require("../../util/progress_bar");

jest.mock("../../util/data_calc");
jest.mock("../../util/words");
jest.mock("../../util/progress_bar");

describe("fim", () => {
  it("responde com a quantidade de dias restantes para o fim do semestre", async () => {
    const msg = {
      reply: jest.fn(),
    };

    days_until.mockReturnValue(50);
    get_random_word.mockReturnValue("palavraAleatoria");
    progressBar.mockReturnValue("progressBar");

    await fim(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      "Faltam 50 palavraAleatoria dias para o fim do semestre\nprogressBar"
    );
  });
});
