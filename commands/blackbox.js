const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'blackbox',
  description: 'Chat with Blackbox AI',
  usage: '-blackbox <question>',
  author: 'Coffee',
  async execute(senderId, args) {
    const pageAccessToken = token;

    // Default to "hi" if no query is provided
    const query = args.join(' ') || 'hi';

    // Automatically add "short direct answer" to the user's prompt
    const modifiedPrompt = `${query.trim()}, short direct answer.`;

    try {
      // Make the request using the modified prompt
      const response = await axios.get(`https://openapi-idk8.onrender.com/blackbox?chat=${encodeURIComponent(modifiedPrompt)}`);

      const data = response.data;
      const formattedMessage = `⿻ | 𝙱𝚕𝚊𝚌𝚔 𝙱𝚘𝚡 \n・───────────・\n${data.response}\n・──── >ᴗ< ─────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error.message);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};