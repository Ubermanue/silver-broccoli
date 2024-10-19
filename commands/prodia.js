const { createProdia } = require('prodia');
const { sendMessage } = require('../handles/sendMessage');
const fetch = require('node-fetch'); // Make sure to install node-fetch if not already installed

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
      const response = await prodia.generate({ prompt });
      if (!response || !response.imageUrl) {
        throw new Error('No image generated.');
      }

      const imageUrl = response.imageUrl;

      // Fetch the image data
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image from Prodia API.');
      }

      const imageBuffer = await imageResponse.buffer();

      // Now you can upload this image buffer to Facebook
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            is_reusable: true, // Make the image reusable
            url: imageUrl // Use the fetched URL instead
          },
        },
      }, pageAccessToken);
      
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};