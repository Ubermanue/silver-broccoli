const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'pinterest',
  description: 'Fetch Pinterest images based on a keyword',
  author: 'coffee',
  usage: 'pinterest <keyword> <number (1-10)>',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!args.length) {
      return await sendMessage(senderId, {
        text: '📷 | Please use this format:\npinterest cat -5'
      }, pageAccessToken);
    }

    if (args.length < 2) {
      return await sendError(senderId, 'Error: Please provide a search term and a number (1-10).', pageAccessToken);
    }

    const searchTerm = args.slice(0, -1).join(' ').trim();
    let numImages = parseInt(args.at(-1), 10);

    if (numImages < 0) {
      numImages = Math.abs(numImages);
    }

    if (isNaN(numImages) || numImages < 1 || numImages > 10) {
      return await sendError(senderId, 'Error: Please provide a number between 1 and 10.', pageAccessToken);
    }

    const apiUrl = `https://pin-kshitiz.vercel.app/pin?search=${encodeURIComponent(searchTerm)}`;

    try {
      const { data } = await axios.get(apiUrl);
      const images = data?.result || [];

      if (images.length) {
        const selectedImages = images.slice(0, numImages);
        for (const imageUrl of selectedImages) {
          await sendMessage(senderId, { image: { url: imageUrl } }, pageAccessToken);
        }
      } else {
        await sendError(senderId, 'Error: No images found for the given keyword.', pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching Pinterest images:', error);
      await sendError(senderId, 'Error: Unable to fetch images. Please try again later.', pageAccessToken);
    }
  },
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};