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
      }, {
        responseType: 'arraybuffer' // Ensure response is treated as binary
      });

      // Create a buffer from the response data
      const imageBuffer = Buffer.from(response.data, 'binary');

      // Send the image as an attachment
      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { 
            url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}` // Convert to base64
          } 
        } 
      }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      await sendMessage(senderId, { text: 'Error: Could not generate image. Please check your request and try again.' }, pageAccessToken);
    }
  }
};