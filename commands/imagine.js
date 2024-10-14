const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage'); // Ensure you have the sendMessage function available

const tokenPath = './token.txt';
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

module.exports = {
  name: 'imagine',
  description: 'Image generator based on prompt',
  author: 'coffee',

  async execute({ senderId, args }) {
    const prompt = args.join(' ');

    if (!prompt) {
      const errorMessage = 'Error: Please provide a prompt for image generation.';
      return sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }

    try {
      // API URL for image generation with the access token if necessary
      const apiUrl = `https://www.samirxpikachu.run.place/arcticfl?prompt=${encodeURIComponent(prompt)}&token=${pageAccessToken}`;
      
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      if (response.status !== 200) {
        const errorMessage = 'Error: Failed to retrieve image.';
        return sendMessage(senderId, { text: errorMessage }, pageAccessToken);
      }

      const formattedMessage = `Here is your generated image based on the prompt: "${prompt}"`;

      // Send the formatted text and the image
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
      await sendMessage(senderId, { attachment: response.data }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = `Error: Failed to retrieve image. ${error.message}`;
      await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};