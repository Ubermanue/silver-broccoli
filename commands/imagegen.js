const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagegen',
  description: 'Generate images using Hugging Face API',
  usage: '-imagegen <prompt>',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');

    try {
      const token = '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';
      const url = "https://api-inference.huggingface.co/models/davisbro/half_illustration";
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const body = {
        inputs: prompt
      };

      const response = await axios.post(url, body, {
        headers: headers,
        responseType: 'arraybuffer'
      });

      // Convert the image buffer to base64
      const base64Image = Buffer.from(response.data).toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      // Send the image as an attachment
      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { 
            url: imageUrl,
            is_reusable: true
          } 
        } 
      }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};