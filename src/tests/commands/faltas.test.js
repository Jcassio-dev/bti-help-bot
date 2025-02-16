const faltas = require("../../handlers/commands/faltas");

describe("faltas", () => {
  it("responde com a quantidade de faltas permitidas para cada carga horária", async () => {
    const msg = {
      reply: jest.fn(),
    };

    await faltas(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("*Bom semestre!*")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("30h: 9 faltas")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("45h: 13 faltas")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("60h: 18 faltas")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("75h: 22 faltas")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("90h: 27 faltas")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("120h: 36 faltas")
    );
  });
});
