const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'imagegen',
  description: 'Generates an image using specified prompt',
  usage: '-imagegen [prompt]',
  author: 'coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, 'Error: Missing input!', pageAccessToken);
    }

    const prompt = args.join(' ').trim();
    await handleImageGeneration(senderId, prompt, pageAccessToken);
  },
};

const handleImageGeneration = async (senderId, prompt, pageAccessToken) => {
  const model = 'davisbro/half_illustration'; // You can change the model as needed
  const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
    "Content-Type": "application/json"
  };

  const body = {
    inputs: prompt
  };

  try {
    const response = await axios.post(apiUrl, body, {
      headers: headers,
      responseType: 'arraybuffer'
    });

    const imageBuffer = Buffer.from(response.data).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBuffer}`;

    const payload = {
      type: 'image',
      payload: {
        url: imageUrl,
        is_reusable: true
      }
    };

    await sendMessage(senderId, { attachment: payload }, pageAccessToken);
  } catch (error) {
    console.error('Error generating image:', error);
    await sendError(senderId, 'Error: Unable to generate the image.', pageAccessToken);
  }
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};