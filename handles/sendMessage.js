const axios = require('axios');

const sendMessage = (senderId, message, pageAccessToken) => {
  if (!message || (!message.text && !message.attachment)) {
    console.error('Error: Message must provide valid text or attachment.');
    return;
  }

  const payload = {
    recipient: { id: senderId },
    message: {
      text: message.text || undefined,
      attachment: message.attachment || undefined,
      quick_replies: message.quick_replies || undefined,
    },
  };

  axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`, payload)
    .then(response => {
      console.log('Message sent successfully:', response.data);
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
};

module.exports = { sendMessage };
