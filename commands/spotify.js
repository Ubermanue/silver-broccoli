const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

module.exports = {
  name: 'spotify',
  description: 'Get a full Spotify track link for a song',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');

    try {
      // Step 1: Query the new Spotify API to find the track
      const apiUrl = `https://deku-rest-apis.ooguy.com/search/spotify?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Step 2: Validate if the API returned any results
      if (response.data && response.data.result && response.data.result.length > 0) {
        const track = response.data.result[0];  // Assuming we take the first track

        // Step 3: Get the track's direct preview URL
        const downloadLink = track.direct_url;

        if (downloadLink) {
          // Step 4: Download the full song
          const cacheDir = path.join(__dirname, 'cache');
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
          }
          const downloadedFilePath = await downloadTrack(downloadLink, cacheDir);

          // Step 5: Upload the song to the platform
          const attachmentId = await uploadAudioToPlatform(downloadedFilePath, pageAccessToken);

          // Step 6: Send the song as a message attachment
          sendMessage(senderId, {
            attachment: {
              type: 'audio',
              payload: {
                attachment_id: attachmentId
              }
            }
          }, pageAccessToken);

          console.log('Audio sent successfully.');
        } else {
          sendMessage(senderId, { text: 'Sorry, no full song available for this track.' }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text: 'Sorry, no Spotify tracks found for that query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error retrieving Spotify track:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

// Helper function to download the track
async function downloadTrack(url, cacheDir) {
  try {
    console.log('Downloading track from:', url);
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
  } catch (error) {
    console.error('Error downloading track:', error);
    throw error;
  }
}

// Helper function to upload the song to the platform
async function uploadAudioToPlatform(filePath, pageAccessToken) {
  const form = new FormData();
  form.append('message', fs.createReadStream(filePath));

  const response = await axios.post(`https://graph.facebook.com/v12.0/me/message_attachments?access_token=${pageAccessToken}`, form, {
    headers: form.getHeaders()
  });

  return response.data.attachment_id;
}

// Helper function to generate a random string for filenames
function generateRandomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}