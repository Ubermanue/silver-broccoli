const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Read the token from a file for authentication
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'llama',
  description: 'Interact with Meta Llama 3.1-8b',
  author: 'Coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || '').trim();

    if (!input) {
      await sendMessage(senderId, { text: `Usage: llama [your question]` }, pageAccessToken);
      return;
    }

    try {
      // Inform the user that their request is being processed
      await sendMessage(senderId, { text: "🔍 Please wait while we're answering your question..." }, pageAccessToken);

      // Make a request to the Llama API endpoint using the echavie variable
      const response = await axios.get(`https://echavie3.nethprojects.workers.dev/ai?model=@cf/meta/llama-3.1-8b-instruct&q=${encodeURIComponent(input)}`);
      const data = response.data;

      // Check if the API response is successful and send the result or error message
      if (!data || !data.success) {
        throw new Error(data.error || 'An error occurred while retrieving the response.');
      }

      const formattedMessage = `🗨️ | 𝙻𝚕𝚊𝚖𝚊 3\n・───────────・\n${data.result}\n・──── >ᴗ< ────・`;

      // Send the formatted response back to the user
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      // Send an error message if something goes wrong
      await sendMessage(senderId, { text: 'Error: An unexpected error occurred. Please try again later.' }, pageAccessToken);
    }
  }
};