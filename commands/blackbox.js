const axios = require('axios');

module.exports = {
  name: 'blackbox',
  description: 'Chat with Blackbox Conversational AI',
  author: 'Coffee',

  async execute({ senderId, args, pageAccessToken, sendMessage }) {
    try {
      // Set a default query if none is provided
      const query = args.join(" ") || "hi";

      const response = await axios.get(`https://openapi-idk8.onrender.com/blackbox?chat=${query}`);

      const data = response.data;
      const formattedMessage = `⿻ | 𝙱𝚕𝚊𝚌𝚔 𝙱𝚘𝚡 \n・───────────・\n${data.response}\n・──── >ᴗ< ─────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: `⿻ | 𝙱𝚕𝚊𝚌𝚔 𝙱𝚘𝚡 \n・───────────・\nError: Unexpected error.\n・──── >ᴗ< ─────・` }, pageAccessToken);
    }
  }
};
