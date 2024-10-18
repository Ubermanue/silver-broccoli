const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'cohere',
  description: 'Interact with Cohere API',
  author: 'Coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'Hello').trim();
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      const response = await axios.get(`https://www.geo-sevent-tooldph.site/api/cohere?prompt=${encodeURIComponent(modifiedPrompt)}`);
      const data = response.data;

      const formattedMessage = `・───────────・\n${data.response.message}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};