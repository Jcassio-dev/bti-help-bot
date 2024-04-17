const fs = require('fs');
const path = require('path');

const commands = {};

fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    const command = require(path.join(__dirname, file));
    const commandName = `!${path.basename(file, '.js')}`;
    
    commands[commandName] = command;
  });

module.exports = commands;