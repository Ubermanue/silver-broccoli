const axios = require('axios');
const { sendMessage, getMessageData } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');
const apiKey = "hgEG2LSoC8VD5A2akNvcFySR"; // Replace with your actual Remove.bg API key

module.exports = {
  name: 'removebg',
  description: 'Remove background from an image. Reply to an image message to use this command.',
  author: 'coffee',

  async execute(senderId, args, messageId, threadId) {
    const pageAccessToken = token;

    try {
      // Get the message data of the replied-to message
      const repliedMessage = await getMessageData(messageId, pageAccessToken);

      console.log("Replied Message Data:", repliedMessage); // Debug log to check the message structure

      if (!repliedMessage || !repliedMessage.message || !repliedMessage.message.attachments || repliedMessage.message.attachments.length === 0) {
        return await sendError(senderId, 'Error: Please reply to a message with an image attachment.', pageAccessToken, threadId);
      }

      const attachment = repliedMessage.message.attachments[0];
      if (attachment.type !== 'photo') { // 'photo' type instead of 'image' based on Messenger's API
        return await sendError(senderId, 'Error: The replied message does not contain an image.', pageAccessToken, threadId);
      }

      const imageUrl = attachment.payload.url;
      await handleRemoveBg(senderId, imageUrl, pageAccessToken, threadId);
    } catch (error) {
      console.error("Error fetching replied message:", error);
      await sendError(senderId, "⚠️ Something went wrong. Please try again later.", pageAccessToken, threadId);
    }
  },
};

const handleRemoveBg = async (senderId, imageUrl, pageAccessToken, threadId) => {
  try {
    // Send a "processing" message
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

    // Delete the temporary file after sending
    fs.unlinkSync(tempFilePath);

  } catch (error) {
    console.error("RemoveBG API call failed: ", error);
    await sendError(senderId, "⚠️ Something went wrong. Please try again later.", pageAccessToken, threadId);
  }
};

const sendError = async (senderId, errorMessage, pageAccessToken, threadId) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken, threadId);
};