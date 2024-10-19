const { createProdia } = require('prodia');
const { sendMessage } = require('../handles/sendMessage');
const axios = require('axios'); // Importing axios

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
      // Generate image using Prodia API
      const response = await prodia.generate({ prompt });
      if (!response || !response.imageUrl) {
        throw new Error('No image generated.');
      }

      const imageUrl = response.imageUrl;

      // Fetch the image data using Axios
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      if (imageResponse.status !== 200) {
        throw new Error('Failed to fetch image from Prodia API.');
      }

      // Convert the image buffer into a base64 string
      const imageBuffer = Buffer.from(imageResponse.data, 'binary').toString('base64');

      // Now you can send the image buffer as a base64-encoded string
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            is_reusable: true,
            url: `data:image/jpeg;base64,${imageBuffer}`, // Use base64 image data
          },
        },
      }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};