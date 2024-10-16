const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  usage: '-help',
  author: 'System',
  execute(senderId, args, pageAccessToken, sendMessage) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map(file => {
      const command = require(path.join(commandsDir, file));
      return {
        name: command.name,
        description: command.description,
        usage: command.usage
      };
    }).sort((a, b) => a.name.localeCompare(b.name)).map(command => {
      return `│ - ${command.name}
│• ${command.description}
│• ${command.usage}
│`;
    });

    const helpMessage = `━━━━━━━━━━━━━━
𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜 
╭─╼━━━━━━━━╾─╮
${commands.join('\n')}
╰─━━━━━━━━━╾─╯
━━━━━━━━━━━━━━`;

    sendMessage(senderId, { text: helpMessage }, pageAccessToken);
  }
};
