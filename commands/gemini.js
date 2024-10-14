const { callGeminiAPI } = require('../utils/callGeminiAPI');

module.exports = {
  name: 'gemini',
  description: 'Ask a question to the Gemini AI',
  author: 'ChatGPT',
  async execute(senderId, args, pageAccessToken, message) {
    const prompt = args.join(' ');
    try {
      await message.reply({ text: '💬 | 𝙰𝚗𝚜𝚠𝚎𝚛𝚒𝚗𝚐...' });

      const response = await callGeminiAPI(prompt);

      // Prepare the full response with header and footer
      const header = 'ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・───────────・\n';
      const footer = '\n・───────────・';
      const fullResponse = `${header}${response}${footer}`;

      // Split the response into chunks if it exceeds 2000 characters
      const maxMessageLength = 2000 - header.length - footer.length; // Adjust for header/footer length
      if (fullResponse.length > 2000) {
        const messages = splitMessageIntoChunks(fullResponse, maxMessageLength);
        for (const messagePart of messages) {
          await message.reply({ text: messagePart });
        }
      } else {
        await message.reply({ text: fullResponse });
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      await message.reply({ text: '.' });
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