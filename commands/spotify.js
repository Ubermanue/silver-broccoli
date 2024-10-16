const axios = require('axios');

module.exports = {
  name: 'spotify',
  description: 'Get a Spotify link for a song',
  usage: '-spotify <song name>',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');

    try {
      const apiUrl = `https://www.samirxpikachu.run.place/spotifysearch?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Check if the API call was successful and results were returned
      if (response.data && response.data.length > 0) {
        const tracks = response.data;
        const firstTrack = tracks[0];
        const audioUrl = firstTrack.preview_mp3;
        if (audioUrl) {
          sendMessage(senderId, {
            attachment: {
              type: 'audio',
              payload: {
                url: audioUrl,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        } else {
          sendMessage(senderId, { text: 'Sorry, no preview available for this track.' }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text: 'Sorry, no Spotify links found for that query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error retrieving Spotify link:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
