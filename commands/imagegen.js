const axios = require('axios');
const fs = require('fs');

async function generateImage(prompt) {
  const token = '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';
  const url = "https://api-inference.huggingface.co/models/davisbro/half_illustration";
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const body = {
    inputs: prompt
  };

  try {
    const response = await axios.post(url, body, {
      headers: headers,
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);
    const imagePath = `${__dirname}/cache/generated_image.png`;
    fs.writeFileSync(imagePath, buffer);

    console.log(`Image generated and saved to ${imagePath}`);
    return imagePath;
  } catch (error) {
    console.error("Error generating image:", error.message);
    console.error("Error response:", error.response.data);
    return null;
  }
}

async function execute(senderId, args) {
  const pageAccessToken = fs.readFileSync('token.txt', 'utf8');

  if (!Array.isArray(args) || args.length === 0) {
    return await sendError(senderId, 'Error: Missing input!', pageAccessToken);
  }

  const prompt = args.join(' ').trim();
  const imagePath = await generateImage(prompt);

  if (imagePath) {
    await sendAttachment(senderId, imagePath, pageAccessToken);
  } else {
    await sendError(senderId, 'Error: Unable to generate image.', pageAccessToken);
  }
}

const sendAttachment = async (senderId, filePath, pageAccessToken) => {
  try {
    const payload = {
      type: 'image',
      payload: {
        url: `file://${filePath}`,
        is_reusable: true
      }
    };

    await sendMessage(senderId, { attachment: payload }, pageAccessToken);
  } catch (error) {
    console.error('Error sending attachment:', error);
    await sendError(senderId, 'Error: Unable to send the generated image.', pageAccessToken);
  }
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};

const sendMessage = async (senderId, message, pageAccessToken) => {
  // Implement your message sending logic here
  console.log(`Sending message to ${senderId}: ${JSON.stringify(message)}`);
};

module.exports = {
  name: 'imagegen',
  description: 'Generate an image based on a prompt',
  author: 'coffee',
  execute,
};