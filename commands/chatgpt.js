const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'chatgpt',
  description: 'Ask a question to GPT-4',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    const header = 'ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・───────────・\n';
    const footer = '\n・──── >ᴗ< ─────・';
    
    try {
      // Use senderId for uid
      const apiUrl = `https://ajiro-rest-api.gleeze.com/api/gpt4o1?prompt=${encodeURIComponent(prompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);
      let { message, img_urls } = response.data;

      // Check if there is a markdown image and extract the image URL
      const markdownImageMatch = message.match(/!.*?(.*?)/);
      if (markdownImageMatch) {
        const imageUrl = markdownImageMatch[1]; // Extract the URL part of the markdown image link
        img_urls = img_urls || []; // Ensure img_urls is defined
        img_urls.push(imageUrl); // Add the extracted URL to img_urls
        message = message.replace(/!.*?.*?/, '').trim(); // Remove the markdown image link from the message
      }

      // If there are image URLs, download and send them as attachments
      if (img_urls && img_urls.length > 0) {
        for (const imgUrl of img_urls) {
          // Define the path for saving images to the cache directory
          const imagePath = path.resolve(__dirname, 'commands/cache', `image_${Date.now()}.png`);
          const writer = fs.createWriteStream(imagePath);

          // Download the image as a stream and save it to disk
          const imageResponse = await axios({
            url: imgUrl,
            method: 'GET',
            responseType: 'stream'
          });

          // Pipe the stream to write it to disk
          imageResponse.data.pipe(writer);

          // Wait until the image has been written to disk
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          // Send the image file as an attachment
          await sendMessage(senderId, {
            attachment: {
              type: 'image',
              payload: { url: `file://${imagePath}` }
            }
          }, pageAccessToken);

          // Optionally delete the image file after sending (if you prefer to remove it afterward)
          fs.unlinkSync(imagePath);
        }
      }

      // If there's a cleaned-up message to send, format and send it
      if (message) {
        const formattedMessage = `${header}${message}${footer}`;

        // Split the response message if it exceeds 2000 characters
        const maxMessageLength = 2000;
        if (formattedMessage.length > maxMessageLength) {
          const messages = splitMessageIntoChunks(formattedMessage, maxMessageLength);
          for (const msg of messages) {
            await sendMessage(senderId, { text: msg }, pageAccessToken);
          }
        } else {
          await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
        }
      }

    } catch (error) {
      console.error('Error calling GPT-4 API or downloading image:', error);
      const errorMessage = `${header}Error: Unable to process the response from API.${footer}`;
      await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};

// Utility function to split long messages into chunks
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}