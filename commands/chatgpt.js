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
      const { message, img_urls } = response.data;

      // If there are image URLs, send them as attachments without the message body
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

      // If there's a message to send, clean and format it
      if (message) {
        // Clean up the message by removing any markdown-style image links
        const cleanMessage = message.replace(/!.*?.*?/, '').trim();

        // Add header and footer to the message
        const formattedMessage = `${header}${cleanMessage}${footer}`;

        // Split the response message if it exceeds 2000 characters
        const maxMessageLength = 2000;
        if (formattedMessage.length > maxMessageLength) {
          const messages = splitMessageIntoChunks(formattedMessage, maxMessageLength);
          for (const msg of messages) {
            await sendMessage(senderId, { text: msg }, pageAccessToken);
          }
        } else {
          // Send the message
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