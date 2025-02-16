const editais = require("../../handlers/commands/editais");

describe("editais", () => {
  it("responde com a lista de editais", async () => {
    const msg = {
      reply: jest.fn(),
    };

    // Mock para global.appContext
    global.appContext = {
      editais: [
        {
          processo: "Processo 1",
          titulo: "Titulo 1",
          inscricao: "Inscricao 1",
          tipo: "Tipo 1",
          valor: "Valor 1",
          link: "Link 1",
        },
      ],
    };

    await editais(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("*Processo 1* - _Titulo 1_")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("*Inscrição:* _Inscricao 1_")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("*Tipo:* _Tipo 1_")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("*Valor:* R$ Valor 1")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("[Link do Edital](Link 1)")
    );
  });
});
