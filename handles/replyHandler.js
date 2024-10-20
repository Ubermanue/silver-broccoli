const axios = require('axios');

// Function to fetch the replied message and validate if it's an image
const getRepliedImage = async (messageId, pageAccessToken) => {
  try {
    const response = await axios.get(`https://graph.facebook.com/v12.0/${messageId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'message,attachments'
      }
    });

    const repliedMessage = response.data;
    console.log("Replied Message Data:", repliedMessage); // Debug log to check the message structure

    if (!repliedMessage || !repliedMessage.attachments || repliedMessage.attachments.data.length === 0) {
      return { error: 'No attachment found in the replied message.' };
    }

    const attachment = repliedMessage.attachments.data[0];
    if (attachment.type !== 'photo') {
      return { error: 'The replied message does not contain an image.' };
    }

    const imageUrl = attachment.media.image.src;
    return { imageUrl };
  } catch (error) {
    console.error("Error fetching message data:", error);
    return { error: 'Error fetching the replied message. Please try again later.' };
  }
};

module.exports = {
  getRepliedImage
};