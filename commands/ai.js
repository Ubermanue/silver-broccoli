const Groq = require('groq-sdk');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

// Load the access token from a file
const token = fs.readFileSync('token.txt', 'utf8');

// Primary and fallback API keys
const API_KEYS = {
  primary: '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',
  fallback: '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',
};

// Initialize Groq with the primary API key
let groq = new Groq({ apiKey: API_KEYS.primary });

const messageHistory = new Map();
const MAX_MESSAGE_LENGTH = 2000;

const wrapResponseMessage = (text) => `
(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠) | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒
・───────────・
${text}
・──── >ᴗ< ─────・
`;

const switchApiKey = () => {
  groq = new Groq({ apiKey: API_KEYS.fallback });
};

const fetchChatCompletion = async (userHistory) => {
  return await groq.chat.completions.create({
    messages: userHistory,
    model: 'llama3-8b-8192',
    temperature: 1,
    max_tokens: 1025,
    top_p: 1,
    stream: true,
    stop: null,
  });
};

const handleApiError = (error, senderId, pageAccessToken) => {
  console.error('Error communicating with Groq:', error.message);
  
  if (error.message.includes('API limit') || error.message.includes('cooldown')) {
    console.log('Switching to fallback API key...');
    switchApiKey();
    return true; // Indicates the need for a retry
  }
  
  sendMessage(senderId, { text: wrapResponseMessage("An error occurred while trying to reach the API.") }, pageAccessToken);
  return false; // No retry
};

module.exports = {
  name: 'ai',
  description: 'Interact with llama3 Ai.',
  usage: '-ai <question>',
  author: 'Nics/Coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;

    // Set a default query if none is provided
    const input = (args.join(' ') || 'hi').trim();
    
    // Automatically add "short direct answer" to the user's prompt
    const modifiedPrompt = `${input}, short direct answer.`;

    try {
      console.log("User Message:", modifiedPrompt);

      const userHistory = messageHistory.get(senderId) ?? [
        { role: 'system', content: 'Your name is Mocha AI. You can answer any questions asked.' },
      ];

      userHistory.push({ role: 'user', content: modifiedPrompt });

      const chatCompletion = await fetchChatCompletion(userHistory);
      let responseMessage = '';

      for await (const chunk of chatCompletion) {
        responseMessage += chunk.choices[0]?.delta?.content || '';

        if (responseMessage.length >= MAX_MESSAGE_LENGTH) {
          sendMessage(senderId, { text: wrapResponseMessage(responseMessage) }, pageAccessToken);
          responseMessage = '';
        }
      }

      if (responseMessage.trim()) {
        userHistory.push({ role: 'assistant', content: responseMessage });
        messageHistory.set(senderId, userHistory);

        sendMessage(senderId, { text: wrapResponseMessage(responseMessage) }, pageAccessToken);
      } else {
        throw new Error("Received empty response from Groq.");
      }
    } catch (error) {
      if (handleApiError(error, senderId, pageAccessToken)) {
        // Retry with fallback API key
        return this.execute(senderId, args);
      }
    }
  }
};