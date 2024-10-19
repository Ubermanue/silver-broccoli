const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const { createProdia } = require('prodia');

const token = fs.readFileSync('token.txt', 'utf8');
const prodiaApiKey = '79fa9d49-0f1e-4e21-a2c2-92891f2833f1';

const prodia = createProdia({
  apiKey: prodiaApiKey,
});

module.exports = {
  name: 'prodia',
  description: 'Generate an image using Prodia API',
  usage: 'prodia <prompt>',
  author: 'coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, 'Error: Missing input!', pageAccessToken);
    }

    const input = args.join(' ').trim();

    try {
      const job = await prodia.generate({
        prompt: input,
      });

      const { imageUrl, status } = await prodia.wait(job);

      if (status === 'completed') {
        const payload = {
          type: 'image',
          payload: {
            url: imageUrl,
          },
        };

        await sendMessage(senderId, { attachment: payload }, pageAccessToken);
      } else {
        await sendError(senderId, 'Error: Unable to generate image.', pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      await sendError(senderId, 'Error: Unexpected error occurred while generating the image.', pageAccessToken);
    }
  },
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};
