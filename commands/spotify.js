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

// Fetch track URLs from the Spotify Play Iota API
const fetchTrackURLs = async (songTitle) => {
  const url = 'https://spotify-play-iota.vercel.app/spotify';
  try {
    const response = await axios.get(url, { params: { query: songTitle } });
    if (response.data.trackURLs?.length) {
      console.log(`Track URLs fetched from ${url}`);
      return response.data.trackURLs;
    }
    console.log(`No track URLs found at ${url}`);
  } catch (error) {
    console.error(`Error with ${url} API:`, error.message);
  }
  return [];
};

// Download the track using the provided URL
const downloadTrack = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = path.join(cacheFolder, `${randomString()}.mp3`);

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(filePath));
      writer.on('error', (error) => {
        console.error("Error downloading track:", error.message);
        reject(new Error("Failed to download track."));
      });
    });
  } catch (error) {
    console.error("Error fetching track URL:", error.message);
    throw new Error("Failed to download track.");
  }
};

// Generate a random string for the filename
const randomString = (length = 10) => Math.random().toString(36).substring(2, 2 + length);

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
      ensureCacheFolderExists();
      const trackURLs = await fetchTrackURLs(query);

      if (!trackURLs.length) {
        return sendMessage(senderId, { text: 'Sorry, no track URLs found for that query.' }, pageAccessToken);
      }

      const downloadLink = trackURLs[0]; // Directly take the first track URL
      const filePath = await downloadTrack(downloadLink);

      // Send the MP3 file as an attachment
      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: filePath,
            is_reusable: true
          }
        }
      }, pageAccessToken);

      // Clean up the downloaded file after sending
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
        else console.log("File deleted successfully.");
      });
    } catch (error) {
      console.error('Error processing Spotify request:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
