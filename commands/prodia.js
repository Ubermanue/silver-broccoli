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
      const apiUrl = `https://api.prodia.com/v1/generate?prompt=${encodeURIComponent(prompt)}&api_key=${prodia.apiKey}`;

      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');

      const formData = new FormData();
      formData.append('attachment', imageBuffer, 'image.png');

      const options = {
        method: 'POST',
        url: `https://graph.facebook.com/v13.0/me/messages?access_token=${pageAccessToken}`,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: formData,
      };

      await axios(options);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};
