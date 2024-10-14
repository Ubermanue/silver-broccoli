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
      // Step 1: Query the Spotify search API to find the track
      const apiUrl = `https://spotify-play-iota.vercel.app/spotify?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Step 2: Validate if the API returned any results
      if (response.data && response.data.trackURLs && response.data.trackURLs.length > 0) {
        const trackURLs = response.data.trackURLs;
        const firstTrackURL = trackURLs[0];

        // Step 3: Extract the track ID from the URL
        const trackId = firstTrackURL.split('/').pop();

        // Step 4: Fetch the full song download link using the track ID
        const trackApiUrl = `https://sp-dl-bice.vercel.app/spotify?id=${encodeURIComponent(trackId)}`;
        const trackResponse = await axios.get(trackApiUrl);

        if (trackResponse.data && trackResponse.data.download_link) {
          const downloadLink = trackResponse.data.download_link;
          if (downloadLink) {
            // Step 5: Download the full song
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
              fs.mkdirSync(cacheDir);
            }
            const downloadedFilePath = await downloadTrack(downloadLink, cacheDir);

            // Step 6: Upload the song to the platform
            const attachmentId = await uploadAudioToPlatform(downloadedFilePath, pageAccessToken);

            // Step 7: Send the song as a message attachment
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
            console.error('Invalid response from track API:', trackResponse.data);
            sendMessage(senderId, { text: 'Sorry, no full song available for this track.' }, pageAccessToken);
          }
        } else if (trackResponse.data && trackResponse.data.url) {
          const downloadLink = trackResponse.data.url;
          if (downloadLink) {
            // Step 8: Download the full song
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
              fs.mkdirSync(cacheDir);
            }
            const downloadedFilePath = await downloadTrack(downloadLink, cacheDir);

            // Step 9: Upload the song to the platform
            const attachmentId = await uploadAudioToPlatform(downloadedFilePath, pageAccessToken);

            // Step 10: Send the song as a message attachment
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
            console.error('Invalid response from track API:', trackResponse.data);
            sendMessage(senderId, { text: 'Sorry, no full song available for this track.' }, pageAccessToken);
          }
        } else {
          console.error('Invalid response from track API:', trackResponse.data);
          sendMessage(senderId, { text: 'Sorry, no full song available for this track.' }, pageAccessToken);
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

// Helper function to download the full song
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
