const { createProdia } = require('prodia');
const { sendMessage } = require('../handles/sendMessage');

const prodia = createProdia({
  apiKey: '79fa9d49-0f1e-4e21-a2c2-92891f2833f1',
});

module.exports = {
  name: 'prodia',
  description: 'Generate images via Prodia using a prompt',
  usage: '-prodia <prompt>',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!Array.isArray(args) || args.length === 0) {
      return sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
    }

    const prompt = args.join(' ');

    try {
      const job = await prodia.generate({ prompt });
      const { imageUrl, status } = await prodia.wait(job);

      if (status === 'success' && imageUrl) {
        return sendMessage(senderId, { attachment: { type: 'image', payload: { url: imageUrl } } }, pageAccessToken);
      }

      sendMessage(senderId, { text: 'Error: Image generation failed or no image URL returned.' }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error.message);
      sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};