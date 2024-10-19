const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'trial',
  description: 'Fetch song lyrics',
  author: 'coffee',

  async execute(senderId, args) {
    if (!Array.isArray(args) || !args.length) {
      return sendError(senderId, 'Error: Please provide a song name!');
    }

    const songQuery = args.join(' ').trim();
    const apiUrl = `https://joshweb.click/search/lyrics?q=${encodeURIComponent(songQuery)}`;

    try {
      const { data: { result: lyricsData } } = await axios.get(apiUrl);

      if (!lyricsData || !lyricsData.lyrics) {
        return sendError(senderId, 'Error: Lyrics not found.');
      }

      const { title, artist, lyrics, image } = lyricsData;
      const lyricsMessage = `🎶 | *Title:* ${title}\n*Artist:* ${artist}\n\n*Lyrics:*\n${lyrics}`;

      // Send the lyrics message first
      await sendMessage(senderId, { text: lyricsMessage });

      // If an image is available, send it as a second message
      if (image) {
        await sendMessage(senderId, {
          attachment: { type: 'image', payload: { url: image } }
        });
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      sendError(senderId, 'Error: Unable to fetch lyrics.');
    }
  },
};

const sendError = async (senderId, errorMessage) => {
  await sendMessage(senderId, { text: errorMessage });
};