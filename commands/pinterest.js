const axios = require('axios');

module.exports = {
  name: 'pinterest',
  description: 'Search Pinterest for images',
  author: 'Your Name',
  async execute({ senderId, args, pageAccessToken, sendMessage }) {
    // Ensure args is defined and is an array, default to an empty string if not
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a search query.' }, pageAccessToken);
      return;
    }

    // Handle the case where user provides a search query and optional number of images
    const match = args.join(' ').match(/(.+)-(\d+)$/);
    const searchQuery = match ? match[1].trim() : args.join(' ');
    let imageCount = match ? parseInt(match[2], 10) : 5;

    // Ensure the user-requested count is within 1 to 20
    imageCount = Math.max(1, Math.min(imageCount, 20));

    try {
      const { data } = await axios.get(`https://hiroshi-api.onrender.com/image/pinterest?search=${encodeURIComponent(searchQuery)}`);

      // Limit the number of images to the user-requested count
      const selectedImages = data.data.slice(0, imageCount);

      if (selectedImages.length === 0) {
        await sendMessage(senderId, { text: `No images found for "${searchQuery}".` }, pageAccessToken);
        return;
      }

      // Send all images as attachments in one message
      const attachments = selectedImages.map(url => ({
        attachment: { type: 'image', payload: { url } }
      }));

      // Send all images in one message
      await sendMessage(senderId, { attachment: attachments }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not fetch images.' }, pageAccessToken);
    }
  }
};