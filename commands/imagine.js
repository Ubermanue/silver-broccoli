const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');
const { PassThrough } = require('stream');

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
      const apiUrl = `https://nash-rest-api-production.up.railway.app/generate-image?prompt=${encodeURIComponent(prompt)}&styleIndex=1`;

      const response = await axios.get(apiUrl);

      if (response.status !== 200) {
        await sendMessage(senderId, { text: 'Error: Failed to retrieve image.' }, pageAccessToken);
        return;
      }

      const imageData = response.data;
      const imageUrl = imageData.image;

      // Fetch the image using axios stream
      const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });

      if (imageResponse.status !== 200) {
        await sendMessage(senderId, { text: 'Error: Failed to retrieve image.' }, pageAccessToken);
        return;
      }

      // Create a buffer to store the image
      const buffer = new PassThrough();

      // Pipe the image stream to the buffer
      imageResponse.data.pipe(buffer);

      // Send the image
      await sendMessage(senderId, { attachment: { type: 'image', payload: buffer } }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};
