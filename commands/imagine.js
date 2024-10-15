const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Image generator based on prompt',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');

    try {
      const apiUrl = `https://ccprojectsjonellapis-production.up.railway.app/api/generate-art?prompt=${encodeURIComponent(prompt)}`;

      const response = await axios.get(apiUrl, { responseType: 'stream' });

      if (response.status !== 200) {
        await sendMessage(senderId, { text: 'Error: Failed to retrieve image.' }, pageAccessToken);
        return;
      }

      await sendMessage(senderId, { attachment: response.data }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};
