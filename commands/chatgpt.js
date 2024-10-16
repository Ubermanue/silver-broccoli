const axios = require('axios');

module.exports = {
  name: 'chatgpt',
  description: 'Ask a question to GPT-4',
  usage: '-chatgpt <question>',
  author: 'Deku (rest api)',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    const header = 'ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・───────────・\n';
    const footer = '\n・──── >ᴗ< ─────・';

    try {
      // Use senderId for uid
      const apiUrl = `https://ajiro-rest-api.gleeze.com/api/gpt4o1?prompt=${encodeURIComponent(prompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);
      const { message, img_urls } = response.data;

      // If there are image URLs, send them as image attachments
      if (img_urls && img_urls.length > 0) {
        for (const imgUrl of img_urls) {
          const attachment = {
            type: 'image',
            payload: { url: imgUrl }
          };
          await sendMessage(senderId, { attachment }, pageAccessToken);
        }
      } else {
        // Clean up the message by removing any unwanted markdown-style image links
        const cleanMessage = message.replace(/!.*?.*?/, '').trim();

        // Add header and footer to the cleaned-up message
        const formattedMessage = `${header}${cleanMessage}${footer}`;

        // Send the message if it's under the character limit, otherwise split it
        const maxMessageLength = 2000;
        if (cleanMessage.length > maxMessageLength) {
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

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}