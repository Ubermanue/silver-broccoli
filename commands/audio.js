const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Read the token once at the top level
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'audio',
  description: 'Search for a Spotify track and get details.',
  author: 'coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, 'Error: Please provide a song name.', pageAccessToken);
    }

    const songName = args.join(' ').trim();
    await handleSpotifySearch(senderId, songName, pageAccessToken);
  },
};

// Function to search for a Spotify track
const handleSpotifySearch = async (senderId, songName, pageAccessToken) => {
  try {
    const apiUrl = `https://hiroshi-api.onrender.com/tiktok/spotify?search=${encodeURIComponent(songName)}`;
    const { data } = await axios.get(apiUrl);

    if (data && data.length > 0) {
      const track = data[0];
      const trackName = track.name;
      const trackLink = track.track;
      const trackImage = track.image;
      const downloadUrl = track.download;

      // Send track details
      const message = `🎶 | Spotify Track Found\n・───────────・\nTrack: ${trackName}\n🔗 [Listen on Spotify](${trackLink})\n・──── >ᴗ< ────・`;

      if (trackImage && downloadUrl) {
        const imagePayload = getAttachmentPayload('image', trackImage);
        const audioPayload = getAttachmentPayload('audio', downloadUrl);

        await sendMessage(senderId, {
          text: message,
          attachment: [imagePayload, audioPayload],
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: message }, pageAccessToken);
      }
    } else {
      await sendError(senderId, 'Error: No tracks found. Please try a different song name.', pageAccessToken);
    }
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    await sendError(senderId, 'Error: Unexpected error occurred while searching for the track.', pageAccessToken);
  }
};

// Function to get attachment payload based on type
const getAttachmentPayload = (type, url) => {
  const supportedTypes = {
    image: { type: 'image', payload: { url } },
    audio: { type: 'audio', payload: { url } },
  };

  return supportedTypes[type] || null;
};

// Centralized error handler for sending error messages
const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};