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

      if (!repliedMessage || !repliedMessage.attachments || repliedMessage.attachments.length === 0) {
        return await sendError(senderId, 'Error: Please reply to a message with an image attachment.', pageAccessToken);
      }

      const attachment = repliedMessage.attachments[0];
      if (attachment.type !== 'image') {
        return await sendError(senderId, 'Error: The replied message does not contain an image.', pageAccessToken);
      }

      const imageUrl = attachment.payload.url;
      await handleRemoveBg(senderId, imageUrl, pageAccessToken, threadId);
    } catch (error) {
      console.error("Error fetching replied message:", error);
      await sendError(senderId, "⚠️ Something went wrong. Please try again later.", pageAccessToken);
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

    // Notify admin of the error
    const errorMessage = `
      ----RemoveBG Log----
      Something is causing an error with the removebg command.
      Check if the API key is still valid at: https://www.remove.bg/dashboard
    `;
    // You might want to implement a way to send this to admin(s)
    console.error(errorMessage);
  }
};

const sendError = async (senderId, errorMessage, pageAccessToken, threadId) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken, threadId);
};
