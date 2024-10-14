const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const tokenPath = './token.txt';
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

module.exports = {
  name: 'imagine',
  description: 'Image generator based on prompt',
  author: 'coffee',
  async execute(senderId, args) {
    console.log('Sender ID:', senderId);

    // Ensure args is defined and is an array, default to an empty string if not
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');

    try {
      // API URL for image generation
      const apiUrl = `https://www.samirxpikachu.run.place/arcticfl?prompt=${encodeURIComponent(prompt)}`;
      
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      if (response.status !== 200) {
        await sendMessage(senderId, { text: 'Error: Failed to retrieve image.' }, pageAccessToken);
        return;
      }

      const formattedMessage = `Here is your generated image based on the prompt: "${prompt}"`;

      // Send the formatted text and the image
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
      await sendMessage(senderId, { attachment: response.data }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};
