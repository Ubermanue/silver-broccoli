const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'cohere',
  description: 'Interact with Cohere AI',
  author: 'Coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hello').trim();

    try {
      const response = await axios.get(`https://hiroshi-api.onrender.com/ai/cohere?ask=${encodeURIComponent(input)}`);
      const data = response.data;
      const formattedMessage = `💬 | 𝙲𝚘𝚑𝚎𝚛𝚎 𝙰𝚒\n・───────────・\n${data.response || 'No response available.'}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};