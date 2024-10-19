const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8').trim(); // Read token from file

module.exports = {
  name: 'imagegen',
  description: 'Generate an image from a text prompt using FLUX',
  author: 'coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, 'Error: Missing input!', pageAccessToken);
    }

    const input = args.join(' ').trim();
    const apiUrl = "https://api-inference.huggingface.co/models/alimama-creative/FLUX.1-Turbo-Alpha";

    try {
      const response = await axios.post(apiUrl, { inputs: input }, {
        headers: {
          Authorization: "Bearer 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", // Use your specific token here
          "Content-Type": "application/json",
        }
      });

      const imageUrl = response.data.url; // Adjust based on the actual response structure

      await sendMessage(senderId, { attachment: { type: 'image', payload: { url: imageUrl } } }, pageAccessToken);
    } catch (error) {
      console.error('Error generating image:', error);
      await sendError(senderId, 'Error: Unable to generate image.', pageAccessToken);
    }
  },
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};
