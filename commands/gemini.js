const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

const apiUrls = [
  { url: 'https://gemini-yvcl.onrender.com/api/ai/chat', params: (prompt, senderId) => ({ prompt: encodeURIComponent(prompt), id: senderId }) },
  { url: 'https://deku-rest-apis.ooguy.com/gemini', params: (prompt) => ({ prompt: encodeURIComponent(prompt) }) },
];

const getGeminiResponse = async (prompt, senderId) => {
  for (const { url, params } of apiUrls) {
    try {
      const response = await axios.get(url, { params: params(prompt, senderId) });
      return response.data.response || response.data.gemini;
    } catch (error) {
      console.error(`Error calling ${url}:`, error);
    }
  }
  throw new Error('Failed to fetch Gemini response from all APIs');
};

const formatResponse = (response) => {
  const header = 'ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・───────────・\n';
  const footer = '\n・──── >ᴗ< ────・';
  return `${header}${response.trim()}${footer}`;
};

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
      const response = await getGeminiResponse(prompt, senderId);
      const fullResponse = formatResponse(response);
      await sendMessage(senderId, { text: fullResponse }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
