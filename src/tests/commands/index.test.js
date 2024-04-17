const fs = require('fs');
const path = require('path');
const commands = require('../../handlers/commands');

describe('commands', () => {
  it('deve carregar todos os comandos JavaScript na pasta handlers/commands', () => {
    const commandFiles = fs.readdirSync(path.join(__dirname, '../../handlers/commands'))
      .filter(file => file !== 'index.js' && file.endsWith('.js'));

    commandFiles.forEach(file => {
      const commandName = `!${path.basename(file, '.js')}`;
      expect(commands).toHaveProperty(commandName);
    });
  });
});