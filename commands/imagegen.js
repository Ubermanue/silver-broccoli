const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagegen',
  description: 'Generate images via prompt',
  usage: '-imagegen <prompt>',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');

    try {
      const url = 'https://api-inference.huggingface.co/models/davisbro/half_illustration';
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
        Referer: `https://huggingface.co/davisbro/half_illustration?text=${encodeURIComponent(prompt)}`,
        'Content-Type': 'application/json',
      };

      const body = {
        inputs: prompt,
      };

      const response = await axios.post(url, body, {
        headers: headers,
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data);
      const imagePath = `${__dirname}/cache/hf.png`;
      fs.writeFileSync(imagePath, buffer);

      await sendMessage(
        senderId,
        { attachment: { type: 'image', payload: { url: `file://${imagePath}` } } },
        pageAccessToken
      );

    } catch (error) {
      console.error('Error:', error.message);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  },
};