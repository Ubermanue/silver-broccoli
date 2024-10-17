const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const Anthropic = require("@anthropic-ai/sdk").default; // Correct import for the SDK

const token = fs.readFileSync('token.txt', 'utf8');

// Split the API key into two parts and concatenate them
const API_KEY_PART1 = 'sk-ant-api03-JrnkoVJd0INXguWHhvkwtrHLfP8s--Ri2Lw_FF5';
const API_KEY_PART2 = 'Ky8GptQoq3nIpImtEoxctPyuCxivwp6eD1yQstP3SUYIOGg-hRxZhgAA';
const API_KEY = API_KEY_PART1 + API_KEY_PART2;

const anthropic = new Anthropic({ apiKey: API_KEY });

module.exports = {
  name: 'claude',
  description: 'Ask a question to Claude.',
  author: 'Coffee',
  usage: 'claude [your question]', // Usage information

  async execute(senderId, args) {
    const pageAccessToken = token;

    // Set a default query if none is provided
    const input = (args.join(' ') || 'Why is the ocean salty?').trim();

    // Automatically add "direct answer" to the user's prompt
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      // Create a message to send to Claude
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620", // Use the appropriate model
        max_tokens: 1000,
        temperature: 0.5,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: modifiedPrompt,
              }
            ]
          }
        ]
      });

      // Extract the response text from the message
      const responseText = msg.text || 'No response received.';
      const formattedMessage = `ᯓ★ | 𝙲𝚕𝚊𝚞𝚍𝚎\n・───────────・\n${responseText}\n・──── >ᴗ< ────・`;

      // Send the response back to the user
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error generating response:', error);
      await sendMessage(senderId, { text: 'Error: Unable to process your question at this time.' }, pageAccessToken);
    }
  }
};