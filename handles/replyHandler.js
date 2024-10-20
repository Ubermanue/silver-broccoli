const { getMessageData } = require('./sendMessage');

// Function to fetch the replied message and validate if it's an image
const getRepliedImage = async (messageId, pageAccessToken) => {
  try {
    const repliedMessage = await getMessageData(messageId, pageAccessToken);

    if (!repliedMessage || !repliedMessage.message || !repliedMessage.message.attachments || repliedMessage.message.attachments.length === 0) {
      return { error: 'No attachment found in the replied message.' };
    }

    const attachment = repliedMessage.message.attachments[0];
    if (attachment.type !== 'photo') {
      return { error: 'The replied message does not contain an image.' };
    }

    const imageUrl = attachment.payload.url;
    return { imageUrl };
  } catch (error) {
    console.error("Error fetching replied message:", error);
    return { error: 'Error fetching the replied message. Please try again later.' };
  }
};

module.exports = {
  getRepliedImage
};