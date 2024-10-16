const axios = require('axios');

module.exports = {
  name: 'chatgpt',
  description: 'Ask a question to GPT-4',
  usage: '-chatgpt <question>',
  author: 'Deku (rest api)',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    // Default to "hi" if no query is provided
    const prompt = (args.join(' ') || 'hi').trim();

    // Automatically add "short direct answer" to the user's prompt
    const modifiedPrompt = `${prompt}, short direct answer.`;

    const header = 'ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・───────────・\n';
    const footer = '\n・──── >ᴗ< ─────・';

    try {
      // Use senderId for uid
      const apiUrl = `https://ajiro-rest-api.gleeze.com/api/gpt4o1?prompt=${encodeURIComponent(modifiedPrompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);
      const { message, img_urls } = response.data;

      console.log('Response data:', response.data);

      // If there are image URLs, send them as image attachments
      if (img_urls && img_urls.length > 0) {
        console.log('Image URLs:', img_urls);
        for (const imgUrl of img_urls) {
          const attachment = {
            type: 'image',
            payload: { url: imgUrl }
          };
          await sendMessage(senderId, { attachment }, pageAccessToken);
        }
      } else {
        console.log('No image URLs found.');
        // Clean up the message by removing any unwanted markdown-style image links
        const cleanMessage = message.replace(/!.*?.*?/, '').trim();

        // Add header and footer to the cleaned-up message
        const formattedMessage = `${header}${cleanMessage}${footer}`;

        // Send the message directly without splitting
        await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling GPT-4 API:', error);
      const errorMessage = `${header}Error: Unexpected response format from API.${footer}`;
      await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};