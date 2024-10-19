const { createProdia } = require('prodia');
const { sendMessage } = require('../handles/sendMessage');
const axios = require('axios');

const prodia = createProdia({
  apiKey: '79fa9d49-0f1e-4e21-a2c2-92891f2833f1',
});

module.exports = {
  name: 'prodia',
  description: 'Generate an image using Prodia API',
  usage: '-prodia <prompt>',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');

    try {
      // Make a request to the Prodia API to generate the image
      const response = await axios.post('https://api.prodia.com/v1/generate', {
        prompt,
        api_key: prodia.apiKey,
      });

      // Ensure that the response has a URL for the generated image
      const imageUrl = response.data.image_url; // Adjust based on the actual response structure

      if (imageUrl) {
        await sendMessage(senderId, { attachment: { type: 'image', payload: { url: imageUrl } } }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Error: No image URL returned from Prodia.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};