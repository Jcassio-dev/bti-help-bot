const ru = require('../../handlers/commands/ru'); 

describe('ru', () => {
  it('responde com o cardápio do RU', async () => {
    // Mock do cardápio do RU
    global.appContext = {
      ruCardapio: JSON.stringify({
        almoco: {
          proteinas: 'Frango assado ao m. de tomate.',
          acompanhamentos: 'Salada crua; Arroz refogado; Feijão preto; Farofa de cebola; Suco; Doce.',
          vegetariano: 'Torta de aveia à pizzaiolo (Contém glúten); Arroz integral.'
        },
        jantar: {
          proteinas: 'Paçoca de carne de sol.',
          acompanhamentos: 'Sopa de frango; Arroz de leite; Pão; Café; Fruta.',
          vegetariano: 'Macarrão integral c/ soja ao m. de tomate'
        }
      })
    };

    // Mock do objeto msg
    const msg = {
      reply: jest.fn()
    };

    await ru(msg);

    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('*Cardápio do RU*'));
    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('*ALMOCO*'));
    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('*JANTAR*'));
    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('Frango assado ao m. de tomate.'));
    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('Paçoca de carne de sol.'));
  });
});