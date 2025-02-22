const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'mixtral',
  description: 'Talk to Mixtral AI',
  usage: '-mixtral <question>',
  author: 'Your Name',

  async execute(senderId, args) {
    const pageAccessToken = token;

    // Set a default query if none is provided
    const query = args.join(" ") || "hi";

    // Automatically add "short direct answer" to the user's prompt
    const modifiedPrompt = `${query.trim()}, direct answer.`;

    try {
      const response = await axios.get(`https://nash-rest-api-production.up.railway.app/Mixtral?userId=${senderId}&message=${encodeURIComponent(modifiedPrompt)}`);
      const data = response.data;

      const formattedMessage = `🗨️ | 𝙼𝚒𝚡𝚝𝚛𝚊𝚕 𝙰𝚒 \n・───────────・\n${data.response}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};