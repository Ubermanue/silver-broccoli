const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'gemini',
  description: 'Interact with Gemini AI.',
  author: 'ChatGPT',
  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a question or prompt.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');

    try {
      const apiUrl = `https://gemini-yvcl.onrender.com/api/ai/chat?prompt=${encodeURIComponent(prompt)}&id=${senderId}`;
      const response = await axios.get(apiUrl);
      const geminiResponse = response.data.response;

      const header = 'ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・───────────・\n';
      const footer = '\n・──── >ᴗ< ────・';
      const fullResponse = `${header}${geminiResponse.trim()}${footer}`;

      await sendMessage(senderId, { text: fullResponse }, pageAccessToken);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
