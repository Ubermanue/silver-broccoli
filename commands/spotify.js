const axios = require('axios');

module.exports = {
  name: 'spotify',
  description: 'Get a Spotify link for a song',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');

    try {
      const apiUrl = `https://deku-rest-apis.ooguy.com/search/spotify?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Check if the API call was successful and results were returned
      if (response.data.status && response.data.result.length > 0) {
        const song = response.data.result[0]; // Get the first song from the results

        const message = `🎵 *${song.title}* by ${song.artist}\n🎤 Album: ${song.artist_album}\n🗓️ Release Date: ${song.album_release_date}\n🎧 [Listen on Spotify](${song.url})`;

        // Send the song information
        sendMessage(senderId, { text: message }, pageAccessToken);

        // Send the audio preview
        sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              url: song.direct_url,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: 'Sorry, no Spotify link found for that query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error retrieving Spotify link:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
