const jobs = require('../../handlers/commands/jobs'); 

describe('jobs', () => {
  it('responde com a lista de empregos', async () => {
    // Mock da lista de empregos
    global.appContext = {
      jobs: [
        {
          title: 'Desenvolvedor',
          deadline: '2022-12-31',
          company: 'Empresa X',
          area: ['TI', 'Desenvolvimento'],
          regime: 'Integral',
          salary: 5000,
          link: 'https://empresax.com/vaga'
        },
      ]
    };

    const msg = {
      reply: jest.fn()
    };

    await jobs(msg);

    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('*Desenvolvedor* - _31/12/2022_'));
    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('*Empresa X* - _TI, Desenvolvimento_'));
    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('Integral, R$ 5000'));
    expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('[Link da Vaga](https://empresax.com/vaga)'));
  });
});