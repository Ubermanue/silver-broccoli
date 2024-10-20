const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const { getRepliedImage } = require('../handles/replyHandler');

const token = fs.readFileSync('token.txt', 'utf8');
const apiKey = "hgEG2LSoC8VD5A2akNvcFySR"; // Replace with your actual Remove.bg API key

module.exports = {
  name: 'removebg',
  description: 'Remove background from an image. Reply to an image message to use this command.',
  author: 'coffee',

  async execute(senderId, args, messageId, threadId) {
    const pageAccessToken = token;

    try {
      const { imageUrl, error } = await getRepliedImage(messageId, pageAccessToken);

      if (error) {
        return await sendError(senderId, `Error: ${error}`, pageAccessToken, threadId);
      }

      await handleRemoveBg(senderId, imageUrl, pageAccessToken, threadId);
    } catch (error) {
      console.error("Error in removebg command:", error);
      await sendError(senderId, "⚠️ Something went wrong. Please try again later.", pageAccessToken, threadId);
    }
  },
};

const handleRemoveBg = async (senderId, imageUrl, pageAccessToken, threadId) => {
  try {
    await sendMessage(senderId, { text: "🕒 Processing image... Please wait." }, pageAccessToken, threadId);

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      {
        image_url: imageUrl,
        size: "auto"
      },
      {
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    const outputBuffer = Buffer.from(response.data, "binary");
    const tempFilePath = `./temp_${Date.now()}.png`;
    fs.writeFileSync(tempFilePath, outputBuffer);

    await sendMessage(senderId, { 
      text: "✅ Background removal complete!",
      attachment: {
        type: 'image',
        payload: {
          url: `file://${tempFilePath}`,
          is_reusable: false
        }
      }
    }, pageAccessToken, threadId);

    fs.unlinkSync(tempFilePath);

  } catch (error) {
    console.error("RemoveBG API call failed: ", error);
    await sendError(senderId, "⚠️ Something went wrong. Please try again later.", pageAccessToken, threadId);
  }
};

const sendError = async (senderId, errorMessage, pageAccessToken, threadId) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken, threadId);
};