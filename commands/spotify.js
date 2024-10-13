const axios = require('axios');

module.exports = {
  name: 'spotify',
  description: 'Get a Spotify link for a song',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');

    try {
      const apiUrl = `https://spotify-play-iota.vercel.app/spotify?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Check if the API call was successful and results were returned
      if (response.data.trackURLs && response.data.trackURLs.length > 0) {
        const trackURLs = response.data.trackURLs;

        // Send the track URLs
        const message = `Found ${trackURLs.length} tracks matching your query:\n\n` + trackURLs.map((url, index) => `${index + 1}. ${url}`).join('\n');
        sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: 'Sorry, no Spotify links found for that query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error retrieving Spotify link:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
