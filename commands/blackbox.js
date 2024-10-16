const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'blackbox',
  description: 'Chat with Blackbox Conversational AI',
  author: 'Coffee',
  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a message.' }, pageAccessToken);
      return;
    }

    const input = args.join(' ');

    try {
      const response = await axios.get(`https://openapi-idk8.onrender.com/blackbox?chat=${input}`);

      const data = response.data;
      const formattedMessage = `⿻ | 𝙱𝚕𝚊𝚌𝚔 𝙱𝚘𝚡 \n・───────────・\n${data.response}\n・──── >ᴗ< ─────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
