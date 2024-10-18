const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'cohere',
  description: 'Cohere-based response command',
  author: 'Coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'Hello').trim();

    try {
      const response = await axios.get(`https://www.geo-sevent-tooldph.site/api/cohere?prompt=${encodeURIComponent(input)}`);
      const data = response.data;
      const formattedMessage = `💬 | 𝙲𝚘𝚑𝚎𝚛𝚎 𝙰𝚒\n・───────────・\n${data.response?.message || 'No response available.'}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};