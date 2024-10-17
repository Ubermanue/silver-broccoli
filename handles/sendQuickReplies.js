const { sendMessage } = require('./sendMessage');

async function sendQuickReplies(senderId, pageAccessToken) {
  const quickReplies = [
    {
      content_type: "text",
      title: "Commands",
      payload: "COMMANDS",
    },
  ];

  await sendMessage(senderId, {
    text: "Tap Commands to see all available commands.",
    quick_replies: quickReplies,
  }, pageAccessToken);
}

module.exports = { sendQuickReplies };
