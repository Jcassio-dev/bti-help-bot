const ru = require("../../handlers/commands/ru");

describe("ru", () => {
  it("responde com o cardápio do RU", async () => {
    global.appContext = {
      ruCardapio: JSON.stringify(
        {
          almoco: {
            proteinas: "Frango assado ao m. de tomate.",
            acompanhamentos:
              "Salada crua; Arroz refogado; Feijão preto; Farofa de cebola; Suco; Doce.",
            vegetariano:
              "Torta de aveia à pizzaiolo (Contém glúten); Arroz integral.",
          },
          jantar: {
            proteinas: "Paçoca de carne de sol.",
            acompanhamentos:
              "Sopa de frango; Arroz de leite; Pão; Café; Fruta.",
            vegetariano: "Macarrão integral c/ soja ao m. de tomate",
          },
        },
        null,
        2
      ),
    };

    const msg = {
      reply: jest.fn(),
    };

    await ru(msg);

    const replyContent = client.sendText(msg.from, .mock.calls[0][0];
    expect(replyContent).toContain("*Cardápio do RU*");
    expect(replyContent).toContain("*ALMOCO*");
    expect(replyContent).toContain("*JANTAR*");
    expect(replyContent).toContain("Frango assado ao m. de tomate.");
    expect(replyContent).toContain("Paçoca de carne de sol.");
  });

  it("responde com uma mensagem de erro quando não é possível acessar o RU", async () => {
    global.appContext = {
      ruCardapio: undefined,
    };

    const msg = {
      reply: jest.fn(),
    };

    await ru(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      "Não foi possível buscar o cardápio do RU. Tente novamente mais tarde.\n"
    );
  });
});
