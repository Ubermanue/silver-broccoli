const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbdl',
  description: 'Fetch a video from a Facebook Reel',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Error: Missing URL!' }, pageAccessToken);
      return;
    }

    const url = args.join(' ');

    try {
      const apiUrl = `https://markdevs-last-api.onrender.com/facebook?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.result) {
        const videoUrl = response.data.result;

        await sendMessage(senderId, { attachment: { type: 'video', payload: { url: videoUrl } } }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Error: Unable to fetch video. Please try again later.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error occurred.' }, pageAccessToken);
    }
  }
};
