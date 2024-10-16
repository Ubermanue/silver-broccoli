const axios = require('axios');

const callGeminiAPI = async (prompt, senderId) => {
  try {
    const apiUrl = `https://gemini-yvcl.onrender.com/api/ai/chat?prompt=${encodeURIComponent(prompt)}&id=${senderId}`;
    const response = await axios.get(apiUrl, { timeout: 5000 });
    return response.data.response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Gemini API call failed: ${error.message}`);
    } else {
      throw error;
    }
  }
};

const splitMessageIntoChunks = (message, chunkSize) => {
  return Array(Math.ceil(message.length / chunkSize)).fill().map((_, index) => message.slice(index * chunkSize, (index + 1) * chunkSize));
};

module.exports = {
  name: 'gemini',
  description: 'Ask a question to the Gemini AI',
  author: 'ChatGPT',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    try {
      const prompt = args.join(' ');
      const response = await callGeminiAPI(prompt, senderId);

      const maxMessageLength = 2000;
      const messages = response.length > maxMessageLength ? splitMessageIntoChunks(response, maxMessageLength) : [response];

      for (const message of messages) {
        await sendMessage(senderId, { text: `ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・───────────・\n${message}\n・──── >ᴗ< ────・` }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      await sendMessage(senderId, { text: `ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・───────────・\nAn error occurred while processing your request.\n・──── >ᴗ< ────・` }, pageAccessToken);
    }
  }
};
