const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'shawty',
  description: 'Fetch a random TikTok video.',
  usage: '-shawty',
  author: 'coffee',

  execute: async (senderId) => {
    const pageAccessToken = token;
    const apiUrl = `https://shoti.kenliejugarap.com/getvideo.php?apikey=shoti-3673ed33bc8186f@b37aba4c425fa@36@e6f30c0863dae181779bad3ee08@6ae95834eb@c8d1ccdf1d21a@b5@b4dc41afe7d@b8063f202@19c1c3fbf7bf1cbb@b1cac4b2d71fabc6c1b760ac0769490baaf4e6@c50`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.status && data.videoDownloadLink) {
        const { title = 'No Title', videoDownloadLink } = data;
        const detailsMessage = { text: `Title: ${title}` };
        const videoMessage = {
          attachment: {
            type: 'video',
            payload: { url: videoDownloadLink }
          }
        };

        await Promise.all([
          sendMessage(senderId, detailsMessage, pageAccessToken),
          sendMessage(senderId, videoMessage, pageAccessToken)
        ]);
      } else {
        sendError(senderId, 'Error: Unable to fetch video details.', pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      sendError(senderId, 'Error: Unexpected error occurred while fetching the video.', pageAccessToken);
    }
  },
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};