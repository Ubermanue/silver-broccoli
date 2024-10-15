const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });

const messageHistory = new Map();
const maxMessageLength = 2000;

const boldFontMap = {
  A: '𝗔',
  B: '𝗕',
  C: '𝗖',
  D: '𝗗',
  E: '𝗘',
  F: '𝗙',
  G: '𝗚',
  H: '𝗛',
  I: '𝗜',
  J: '𝗝',
  K: '𝗞',
  L: '𝗟',
  M: '𝗠',
  N: '𝗡',
  O: '𝗢',
  P: '𝗣',
  Q: '𝗤',
  R: '𝗥',
  S: '𝗦',
  T: '𝗧',
  U: '𝗨',
  V: '𝗩',
  W: '𝗪',
  X: '𝗫',
  Y: '𝗬',
  Z: '𝗭',
  a: '𝗮',
  b: '𝗯',
  c: '𝗰',
  d: '𝗱',
  e: '𝗲',
  f: '𝗳',
  g: '𝗴',
  h: '𝗵',
  i: '𝗶',
  j: '𝗷',
  k: '𝗸',
  l: '𝗹',
  m: '𝗺',
  n: '𝗻',
  o: '𝗼',
  p: '𝗽',
  q: '𝗾',
  r: '𝗿',
  s: '𝘀',
  t: '𝘁',
  u: '𝘂',
  v: '𝘃',
  w: '𝘄',
  x: '𝘅',
  y: '𝘆',
  z: '𝘇',
  0: '𝟬',
  1: '𝟭',
  2: '𝟮',
  3: '𝟯',
  4: '𝟰',
  5: '𝟱',
  6: '𝟲',
  7: '𝟳',
  8: '𝟴',
  9: '𝟵'
};

const splitMessageIntoChunks = (text, maxLength) => {
  const messages = [];
  for (let i = 0; i < text.length; i += maxLength) {
    messages.push(text.slice(i, i + maxLength));
  }
  return messages;
};

const applyBoldFont = (text) => {
  return text.split('').map(char => boldFontMap[char] || char).join('');
};

const transformBoldContent = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, (_, boldText) => applyBoldFont(boldText));
};

const wrapResponseMessage = (text) => {
  const header = "(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠) | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n・───────────・\n";
  const footer = "\n・──── >ᴗ< ─────・";
  return `${header}${text}${footer}`;
};

module.exports = {
  name: 'ai',
  description: 'response within seconds',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    try {
      console.log("User Message:", messageText);

      // Send an empty message to indicate processing
      sendMessage(senderId, { text: '' }, pageAccessToken);

      const userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'Your name is Mocha AI. You can answer any questions asked.' });
      }
      userHistory.push({ role: 'user', content: messageText });

const chatCompletion = await groq.chat.completions.create({
  messages: userHistory,
  model: 'llama3-8b-8192',
  temperature: 1,
  max_tokens: 1025,
  top_p: 1,
  stream: true,
  stop: null
});

let responseMessage = '';

for await (const chunk of chatCompletion) {
  const chunkContent = chunk.choices[0]?.delta?.content || '';
  responseMessage += chunkContent;

  if (responseMessage.length >= maxMessageLength) {
    const messages = splitMessageIntoChunks(responseMessage, maxMessageLength);
    for (const message of messages) {
      let transformedMessage = transformBoldContent(message);
      // Check if the transformed message is not empty
      if (transformedMessage.trim().length > 0) {
        sendMessage(senderId, { text: wrapResponseMessage(transformedMessage) }, pageAccessToken);
      }
    }
    responseMessage = '';
  }
}

// Send any remaining part of the response
if (responseMessage.trim()) {
  userHistory.push({ role: 'assistant', content: responseMessage });
  messageHistory.set(senderId, userHistory);

  let transformedMessage = transformBoldContent(responseMessage);
  sendMessage(senderId, { text: wrapResponseMessage(transformedMessage) }, pageAccessToken);
} else {
  throw new Error("Received empty response from Groq.");
}

} catch (error) {
  console.error('Error communicating with Groq:', error.message);
  sendMessage(senderId, { text: wrapResponseMessage("An error occurred while trying to reach the API.") }, pageAccessToken);
}
}
};
