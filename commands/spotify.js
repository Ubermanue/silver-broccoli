const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: 'spotify',
  description: 'Get a Spotify link for a song',
  author: 'Deku (rest api)',
  
  async execute(senderId, args, pageAccessToken, sendMessage) {
    // Start processing
    try {
      let songName = '';

      // Check if the user provided a song name
      if (args.length === 0) {
        throw new Error("Please provide a song name.");
      } else {
        songName = args.join(" ");
      }

      // Search for the song on Spotify
      const g = await axios.get(`https://spotify-play-iota.vercel.app/spotify?query=${encodeURIComponent(songName)}`);
      const trackURLs = g.data.trackURLs;
      if (!trackURLs || trackURLs.length === 0) {
        throw new Error("No track found for the provided song name.");
      }

      // Get the first track and download it
      const trackID = trackURLs[0];
      const j = await axios.get(`https://sp-dl-bice.vercel.app/spotify?id=${encodeURIComponent(trackID)}`);
      const downloadLink = j.data.download_link;

      // Ensure the cache directory exists
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      // Download the track
      const downloadedFilePath = await downloadTrack(downloadLink, cacheDir);

      // Reply with the downloaded audio
      sendMessage(senderId, {
        attachment: fs.createReadStream(downloadedFilePath),
      }, pageAccessToken);

      console.log("Audio sent successfully.");

    } catch (error) {
      console.error("Error occurred:", error);
      sendMessage(senderId, { text: `An error occurred: ${error.message}` }, pageAccessToken);
    }
  }
};

// Helper function to generate a random string for filenames
function generateRandomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Function to download the track using axios
async function downloadTrack(url, cacheDir) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  const filePath = path.join(cacheDir, `${generateRandomString()}.mp3`);
  const fileStream = fs.createWriteStream(filePath);

  response.data.pipe(fileStream);

  return new Promise((resolve, reject) => {
    fileStream.on('finish', () => resolve(filePath));
    fileStream.on('error', reject);
  });
}