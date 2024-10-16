const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'alldl',
  description: 'Get videos from platforms',
  usage: '-alldl <link>',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Error: Missing URL!' }, pageAccessToken);
      return;
    }

    const url = args.join(' ');

    try {
      if (url.includes('tiktok.com')) {
        // TikTok
        const apiUrl = `https://hiroshi-api.onrender.com/tiktok/download?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.code === 0) {
          const videoUrl = response.data.data.play;
          await sendMessage(senderId, { attachment: { type: 'video', payload: { url: videoUrl } } }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: 'Error: Unable to fetch TikTok video. Please try again later.' }, pageAccessToken);
        }
        return;
      }

      const apiUrl = `https://ajiro-rest-api.gleeze.com/api/downloader?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.content && response.data.content.status === true) {
        const data = response.data.content.data;

        if (data.result) {
          // Facebook
          const hdVideoUrl = data.result.find((result) => result.quality === 'HD');
          if (hdVideoUrl) {
            await sendMessage(senderId, { attachment: { type: 'video', payload: { url: hdVideoUrl.url } } }, pageAccessToken);
          } else {
            await sendMessage(senderId, { text: 'Error: Unable to find HD quality video.' }, pageAccessToken);
          }
        } else if (data.url) {
          // Instagram
          const videoUrls = data.url;
          await sendMessage(senderId, { text: 'Video URLs:' }, pageAccessToken);
          videoUrls.forEach((videoUrl) => {
            sendMessage(senderId, { attachment: { type: 'video', payload: { url: videoUrl } } }, pageAccessToken);
          });
        } else {
          await sendMessage(senderId, { text: 'Error: Unable to fetch video. Please try again later.' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: 'Error: Unable to fetch video. Please try again later.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error occurred.' }, pageAccessToken);
    }
  }
};