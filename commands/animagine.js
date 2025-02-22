const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'animagine',
  description: 'Generates an anime image based on a prompt.',
  usage: 'animagine [prompt]',
  author: 'coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, 'Error: Missing input for image generation!', pageAccessToken);
    }

    const prompt = args.join(' ').trim();
    const apiUrl = `https://markdevs-last-api.onrender.com/emi?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary').toString('base64');
      
      const payload = {
        type: 'image',
        payload: {
          is_reusable: true,
          url: `data:image/jpeg;base64,${imageBuffer}`
        },
      };

      await sendMessage(senderId, { attachment: payload }, pageAccessToken);
    } catch (error) {
      console.error('Error generating image:', error);
      await sendError(senderId, 'Error: Unexpected error occurred while generating image.', pageAccessToken);
    }
  },
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};