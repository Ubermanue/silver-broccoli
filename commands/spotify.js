const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

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
        // Step 1: Download the audio file from the Spotify link
        const audioResponse = await axios.get(spotifyLink, { responseType: 'stream' });
        const filePath = `/tmp/${Date.now()}.mp3`; // Temporarily store the file
        
        // Step 2: Save the file to disk temporarily
        const writer = fs.createWriteStream(filePath);
        audioResponse.data.pipe(writer);
        
        // Wait for the file to finish writing
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Step 3: Upload the file to Facebook via attachment upload process
        const form = new FormData();
        form.append('filedata', fs.createReadStream(filePath));
        form.append('access_token', pageAccessToken);

        const uploadUrl = `https://graph.facebook.com/v11.0/me/message_attachments`;
        const uploadResponse = await axios.post(uploadUrl, form, {
          headers: {
            ...form.getHeaders(),
          },
        });

        const attachmentId = uploadResponse.data.attachment_id;

        // Step 4: Send the audio file as an attachment
        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              attachment_id: attachmentId,
              is_reusable: true
            }
          }
        }, pageAccessToken);

        // Step 5: Clean up the temporary file
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });

      } else {
        sendMessage(senderId, { text: 'Sorry, no Spotify track found for that query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error retrieving Spotify track or uploading:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};