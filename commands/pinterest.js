const axios = require('axios');

module.exports = {
  name: 'pinterest',
  description: 'Search Pinterest for images',
  author: 'coffee',


  async execute({ senderId, args, pageAccessToken, sendMessage }) {
    const input = args.join(' ');
    const match = input.match(/(.+)-(\d+)$/);
    const searchQuery = match ? match[1].trim() : input;
    let imageCount = match ? parseInt(match[2], 10) : 5;

    // Ensure the user-requested count is within 1 to 20
    if (isNaN(imageCount) || imageCount < 1) imageCount = 1;
    if (imageCount > 20) imageCount = 20;

    try {
      const { data } = await axios.get(`https://hiroshi-api.onrender.com/image/pinterest?search=${encodeURIComponent(searchQuery)}`);

      // Limit the number of images to the user-requested count
      const selectedImages = data.data.slice(0, imageCount);

      if (selectedImages.length === 0) {
        const noImagesMessage = `No images found for "${searchQuery}".`;
        await sendMessage(senderId, { text: noImagesMessage }, pageAccessToken);
        return;
      }

      // Build the message with all images as attachments in one message
      const attachments = selectedImages.map(url => ({
        attachment: { type: 'image', payload: { url } }
      }));

      await sendMessage(senderId, { attachments }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = `Error: Could not fetch images.`;
      await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};