const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');
const MAX_MESSAGE_LENGTH = 2000;

module.exports = {
  name: 'cohere',
  description: 'Interact with Cohere AI',
  author: 'Coffee',
  usage: 'cohere [question/message]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hello').trim();

    try {
      const response = await axios.get(`https://hiroshi-api.onrender.com/ai/cohere?ask=${encodeURIComponent(input)}`);
      const data = response.data;
      const responseText = data.response || 'No response available.';
      const formattedMessage = `💬 | 𝙲𝚘𝚑𝚎𝚛𝚎 𝙰𝚒\n・───────────・\n${responseText}\n・──── >ᴗ< ────・`;

      // Truncate the message if it exceeds the maximum allowed length
      const truncatedMessage = formattedMessage.substring(0, MAX_MESSAGE_LENGTH);

      await sendMessage(senderId, { text: truncatedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
