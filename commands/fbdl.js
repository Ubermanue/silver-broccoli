const axios = require('axios');
const request = require('request'); // Add request to send message

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
        request({
          url: 'https://graph.facebook.com/v13.0/me/messages',
          qs: { access_token: pageAccessToken },
          method: 'POST',
          json: {
            recipient: { id: senderId },
            message: { text: 'Error: Missing URL!' },
          },
        });
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
        request({
          url: 'https://graph.facebook.com/v13.0/me/messages',
          qs: { access_token: pageAccessToken },
          method: 'POST',
          json: {
            recipient: { id: senderId },
            message: { attachment },
          },
        });
      } else {
        // Send an error message if the video could not be fetched
        request({
          url: 'https://graph.facebook.com/v13.0/me/messages',
          qs: { access_token: pageAccessToken },
          method: 'POST',
          json: {
            recipient: { id: senderId },
            message: { text: 'Error: Unable to fetch video. Please try again later.' },
          },
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // Send an error message for unexpected errors
      request({
        url: 'https://graph.facebook.com/v13.0/me/messages',
        qs: { access_token: pageAccessToken },
        method: 'POST',
        json: {
          recipient: { id: senderId },
          message: { text: 'Error: Unexpected error occurred.' },
        },
      });
    }
  }
};