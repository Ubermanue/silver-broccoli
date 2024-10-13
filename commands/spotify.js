const axios = require('axios');
const fs = require('fs');
const path = require('path');

const cacheFolder = path.join(__dirname, 'commands', 'cache');

// Ensure the cache folder exists
const ensureCacheFolderExists = () => {
  if (!fs.existsSync(cacheFolder)) {
    fs.mkdirSync(cacheFolder, { recursive: true });
  }
};

// Download and stream the track using Axios
const downloadTrack = async (url) => {
  ensureCacheFolderExists();
  const filePath = path.join(cacheFolder, `${Date.now()}.mp3`);

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading track:', error.message);
    throw new Error('Failed to download track.');
  }
};

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
      // Fetch the Spotify track URL from the API
      const apiUrl = `https://spotify-play-iota.vercel.app/spotify?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Assuming the response contains the Spotify link in 'trackURLs[0]'
      const spotifyLink = response.data.trackURLs?.[0];

      if (spotifyLink) {
        // Download the Spotify track using the stream
        const filePath = await downloadTrack(spotifyLink);

        // Send the MP3 file as an attachment
        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              url: filePath,  // Send the local file path of the downloaded audio
              is_reusable: true
            }
          }
        }, pageAccessToken);

        // Clean up the downloaded file after sending
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
          else console.log("File deleted successfully.");
        });
      } else {
        sendMessage(senderId, { text: 'Sorry, no Spotify track found for that query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error processing Spotify request:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};