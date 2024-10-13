const axios = require('axios');

module.exports = {
  name: 'spotify',
  description: 'Get a Spotify link for a song',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');

    if (!query) {
      return sendMessage(senderId, { text: 'Please provide a song name.' }, pageAccessToken);
    }

    try {
      // Fetch the Spotify link from an API
      const apiUrl = `https://spotify-play-iota.vercel.app/spotify?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Assuming the response contains the Spotify link in 'trackURLs[0]'
      const spotifyLink = response.data.trackURLs?.[0];

      if (spotifyLink) {
        // Send the Spotify link directly as an audio attachment
        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              url: spotifyLink,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: 'Sorry, no Spotify track found for that query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error retrieving Spotify track:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
