const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

const header = 'ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・───────────・\n';
const footer = '\n・──── >ᴗ< ────・';

module.exports = {
  name: 'gemini',
  description: 'Talk to Gemini AI',
  author: 'Your Name',
  async execute(senderId, args) {
    const pageAccessToken = token;

    // Set a default query if none is provided
    const query = args.join(" ") || "hi";

    try {
      const response = await axios.get(`https://nash-rest-api-production.up.railway.app/gemini-1.5-flash-latest?prompt=${query}`);
      const author = response.data.author;
      const geminiResponse = response.data.response;

      // Verify that the author is indeed NashBot
      if (author === 'NashBot' && geminiResponse) {
        const formattedMessage = `${header}${geminiResponse}${footer}`;
        await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
      } else {
        console.error('Error: Unexpected author or no response');
        await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};