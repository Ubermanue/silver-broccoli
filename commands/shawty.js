const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'shawty',
  description: 'Fetch TikTok video details and send the video',
  author: 'coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, 'Error: Missing input!', pageAccessToken);
    }

    const inputUrl = args.join(' ').trim();
    if (!isValidUrl(inputUrl)) {
      return await sendError(senderId, 'Error: Invalid URL!', pageAccessToken);
    }

    const apiUrl = `https://shoti.kenliejugarap.com/getvideo.php?apikey=shoti-3673ed33bc8186f@b37aba4c425fa@36@e6f30c0863dae181779bad3ee08@6ae95834eb@c8d1ccdf1d21a@b5@b4dc41afe7d@b8063f202@19c1c3fbf7bf1cbb@b1cac4b2d71fabc6c1b760ac0769490baaf4e6@c50&url=${encodeURIComponent(inputUrl)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.status && data.videoDownloadLink) {
        const title = data.title || 'No Title';
        const username = data.username || 'Unknown User';

        // Send title and username first
        const message = `Title: ${title}\nUsername: ${username}`;
        await sendMessage(senderId, { text: message }, pageAccessToken);

        // Send the video separately
        await sendMessage(senderId, { attachment: { type: 'video', payload: { url: data.videoDownloadLink } } }, pageAccessToken);
      } else {
        await sendError(senderId, 'Error: Unable to fetch video details.', pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      await sendError(senderId, 'Error: Unexpected error occurred while fetching the video.', pageAccessToken);
    }
  },
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};