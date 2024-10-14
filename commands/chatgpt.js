const axios = require('axios');

module.exports = {
  name: 'chatgpt',
  description: 'Ask a question to GPT-4',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    const header = 'ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・───────────・\n';
    const footer = '\n・──── >ᴗ< ─────・';
    
    try {
      // Use senderId for uid
      const apiUrl = `https://ajiro-rest-api.gleeze.com/api/gpt4o1?prompt=${encodeURIComponent(prompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);
      let { message, img_urls } = response.data;

      // Check if the response message contains a markdown-style image link
      const markdownImageMatch = message.match(/!.*?(.*?)/);
      if (markdownImageMatch) {
        const imageUrl = markdownImageMatch[1]; // Extract the URL part of the markdown image link
        img_urls = img_urls || []; // Ensure img_urls is defined
        img_urls.push(imageUrl); // Add the extracted URL to img_urls
        message = message.replace(/!.*?.*?/, '').trim(); // Remove the markdown image link from the message
      }

      // If there are image URLs, send them as attachments
      if (img_urls && img_urls.length > 0) {
        for (const imgUrl of img_urls) {
          await sendMessage(senderId, { 
            attachment: { 
              type: 'image', 
              payload: { url: imgUrl } 
            } 
          }, pageAccessToken);
        }
      }

      // If there's a message to send, format and send it
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
      console.error('Error calling GPT-4 API:', error);
      const errorMessage = `${header}Error: Unexpected response format from API.${footer}`;
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