const axios = require('axios');

module.exports = {
  name: 'imagine',
  description: 'Image generator based on prompt',
  author: 'coffee',

  async execute({ senderId, args, pageAccessToken, sendMessage }) {
    const prompt = args.join(' ');

    if (!prompt) {
      const errorMessage = 'Error: Please provide a prompt for image generation.';
      return sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }

    try {
      // API URL for image generation
      const apiUrl = `https://www.samirxpikachu.run.place/arcticfl?prompt=${encodeURIComponent(prompt)}`;
      
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