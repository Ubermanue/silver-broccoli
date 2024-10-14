const axios = require('axios');

module.exports = {
  name: 'imagine',
  description: 'Image generator based on prompt',
  author: 'coffee',
  async execute({ senderId, args, pageAccessToken, sendMessage }) {
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
        const errorMessage = 'Error: Failed to retrieve image.';
        await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
        return;
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
