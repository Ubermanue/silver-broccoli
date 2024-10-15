const axios = require('axios');
const { sendMessage } = require('./handles/sendMessage'); // Adjusted path based on provided link

module.exports = {
  name: 'fbdl',
  description: 'Fetch a video from a Facebook Reel',
  author: 'coffee',

  async execute({ senderId, args, pageAccessToken }) {
    // Join the arguments to form the complete URL
    const url = args.join(' ');

    try {
      // Check if the URL is provided
      if (!url) {
        // Send an error message if the URL is missing
        await sendMessage(senderId, { text: 'Error: Missing URL!' }, pageAccessToken);
        return;
      }

      // Make a request to the API
      const apiUrl = `https://markdevs-last-api.onrender.com/facebook?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);

      // Check for successful response
      if (response.data && response.data.result) {
        const videoUrl = response.data.result;

        // Prepare the attachment payload
        const attachment = {
          type: 'video',
          payload: {
            url: videoUrl,
          },
        };

        // Send the video attachment directly
        await sendMessage(senderId, { attachment }, pageAccessToken);
      } else {
        // Send an error message if the video could not be fetched
        await sendMessage(senderId, { text: 'Error: Unable to fetch video. Please try again later.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      // Send an error message for unexpected errors
      await sendMessage(senderId, { text: 'Error: Unexpected error occurred.' }, pageAccessToken);
    }
  }
};