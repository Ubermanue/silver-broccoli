const { sendMessage } = require('./sendMessage');
const { loadCommands } = require('../index');

async function sendCommands(senderId, pageAccessToken) {
  const commands = loadCommands();

  const quickReplies = commands.map(command => ({
    content_type: "text",
    title: command.name.replace('-', ''),
    payload: command.name,
  }));

  await sendMessage(senderId, {
    quick_replies: quickReplies,
  }, pageAccessToken);
}

module.exports = { sendCommands };
