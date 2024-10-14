const axios = require('axios');
module.exports = {
  name: 'chatgpt',
  description: 'Ask a question to GPT-4',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    const header = 'ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・───────────・\n';
    const footer = '\n・──── >ᴗ< ─────・';
    try {
      const apiUrl = `https://ajiro-rest-api.gleeze.com/api/gpt4o1?prompt=${encodeURIComponent(prompt)}&uid=100${senderId}`;
      const response = await axios.get(apiUrl);
      const { message, img_urls } = response.data;

      // Clean up the message by removing the markdown-style image link
      const cleanMessage = message.replace(/!.*?.*?/, '').trim();
      
      // Add header and footer to the message
      const formattedMessage = `${header}${cleanMessage}${footer}`;

      // Split the response message if it exceeds 2000 characters
      const maxMessageLength = 2000;
      if (cleanMessage.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(formattedMessage, maxMessageLength);
        for (const msg of messages) {
          sendMessage(senderId, { text: msg }, pageAccessToken);
        }
      } else if (!img_urls || img_urls.length === 0) {
        // Only send the message if no images are present
        sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
      }

      // If there are image URLs, send them as attachments without the message body
      if (img_urls && img_urls.length > 0) {
        for (const imgUrl of img_urls) {
          sendMessage(senderId, { attachment: { type: 'image', payload: { url: imgUrl } } }, pageAccessToken);
        }
      }
    } catch (error) {
      console.error('Error calling GPT-4 API:', error);
      const errorMessage = `${header}Error: Unexpected response format from API.${footer}`;
      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
