const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'alldl',
  description: 'Downloads a video from Facebook, TikTok, Instagram, and YouTube',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Error: Missing URL!' }, pageAccessToken);
      return;
    }

    const url = args.join(' ');

    try {
      let apiUrl;
      if (url.includes('youtube.com')) {
        apiUrl = `https://ajiro-rest-api.gleeze.com/api/downloaderV2?url=${encodeURIComponent(url)}`;
      } else {
        apiUrl = `https://ajiro-rest-api.gleeze.com/api/downloader?url=${encodeURIComponent(url)}`;
      }

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
        } else if (data.mp4NoWm) {
          // TikTok
          const videoUrl = data.mp4NoWm[0];
          await sendMessage(senderId, { attachment: { type: 'video', payload: { url: videoUrl } } }, pageAccessToken);
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
      } else if (response.data && response.data.content && response.data.content.status === 'stream') {
        // YouTube
        const videoUrl = response.data.content.url;
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
