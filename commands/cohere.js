const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'cohere',
  description: 'Interact with Cohere AI',
  usage: '-cohere [question]',
  author: 'Coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hello').trim();

    try {
      const response = await axios.get(`https://hiroshi-api.onrender.com/ai/cohere?ask=${encodeURIComponent(input)}`);
      const data = response.data;
      const messageContent = data.response || 'No response available.';
      
      // Truncate message if it exceeds 2000 characters
      const truncatedMessage = messageContent.length > 2000 
        ? `${messageContent.substring(0, 1997)}...` 
        : messageContent;

      const formattedMessage = `💬 | 𝙲𝚘𝚑𝚎𝚛𝚎 𝙰𝚒\n・───────────・\n${truncatedMessage}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};