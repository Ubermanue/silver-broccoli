const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commandsList = commandFiles.map(file => {
  const command = require(`../commands/${file}`);
  return command.name && command.description ? `${command.name}: ${command.description}` : null;
}).filter(Boolean).join('\n');

const handlePostback = (event, pageAccessToken) => {
  const senderId = event.sender?.id;
  const payload = event.postback?.payload;

  if (senderId && payload) {
    if (payload === 'SHOW_COMMANDS') {
      sendMessage(senderId, { text: `Here are the available commands:\n${commandsList}` }, pageAccessToken);
    } else {
      sendMessage(senderId, { text: `You sent a postback with payload: ${payload}` }, pageAccessToken);
    }
  } else {
    console.error('Invalid postback event data');
  }
};

module.exports = { handlePostback };