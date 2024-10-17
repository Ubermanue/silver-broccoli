const { sendMessage } = require('./sendMessage');

const handlePostback = (event, pageAccessToken) => {
  const senderId = event.sender?.id;
  const payload = event.postback?.payload;

  if (senderId && payload) {
    // Send a message back to the sender
    sendMessage(senderId, { text: `You sent a postback with payload: ${payload}` }, pageAccessToken);
  } else {
    console.error('Invalid postback event data');
  }
};

module.exports = { handlePostback };