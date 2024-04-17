const grade = require('../../handlers/commands/grade');
const { MessageMedia } = require('whatsapp-web.js');

describe('grade', () => {
  it('responde com a lista de grades disponíveis quando a grade não é especificada', async () => {
    const msg = {
      reply: jest.fn(),
      body: "!grade",
    };

    const client = {
      sendMessage: jest.fn(),
    };

    await grade(msg, client);

    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('Tente: !grade <nome-da-grade>\nDisponíveis:\nnoturno\nintegral\ncc\nes'));
  });

  it('responde com a imagem da grade geral quando a grade geral integral é especificada', async () => {
    const msg = {
      reply: jest.fn(),
      body: "!grade integral",
      from: "chatId",
    };

    const client = {
      sendMessage: jest.fn(),
    };

    await grade(msg, client);

    const image = MessageMedia.fromFilePath("./src/content/imgs/grade-geral-i.jpeg");

    expect(client.sendMessage).toHaveBeenCalledWith("chatId", image, { caption: "Essa é a grade Geral do Integral." });
  });

  it('responde com a imagem da grade geral quando a grade geral noturno é especificada', async () => {
    const msg = {
      reply: jest.fn(),
      body: "!grade noturno",
      from: "chatId",
    };

    const client = {
      sendMessage: jest.fn(),
    };

    await grade(msg, client);

    const image = MessageMedia.fromFilePath("./src/content/imgs/grade-geral.jpeg");

    expect(client.sendMessage).toHaveBeenCalledWith("chatId", image, { caption: "Essa é a grade Geral do Noturno." });
  });


  it('responde com a imagem da grade cc quando a grade cc é especificada', async () => {
    const msg = {
      reply: jest.fn(),
      body: "!grade cc",
      from: "chatId",
    };

    const client = {
      sendMessage: jest.fn(),
    };

    await grade(msg, client);

    const image = MessageMedia.fromFilePath("./src/content/imgs/grade-cc.jpeg");

    expect(client.sendMessage).toHaveBeenCalledWith("chatId", image, { caption: "Essa é a grade da enfase em Ciência da Computação." });
  });

  it('responde com a imagem da grade es quando a grade es é especificada', async () => {
    const msg = {
      reply: jest.fn(),
      body: "!grade es",
      from: "chatId",
    };

    const client = {
      sendMessage: jest.fn(),
    };

    await grade(msg, client);

    const image = MessageMedia.fromFilePath("./src/content/imgs/grade-es.jpeg");

    expect(client.sendMessage).toHaveBeenCalledWith("chatId", image, { caption: "Essa é a grade da enfase em Engenharia de Software." });
  });
});