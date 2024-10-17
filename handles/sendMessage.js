const request = require('request');

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
    },
  };

  request({
    url: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: pageAccessToken },
    method: 'POST',
    json: payload,
  }, (error, response) => {
    if (error) {
      console.error('Error sending message:', error);
    } else if (response.body?.error) {
      console.error('Error response:', response.body.error);
    } else {
      console.log('Message sent successfully:', response.body);
    }
  });
};

module.exports = { sendMessage };