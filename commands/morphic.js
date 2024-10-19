const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const FormData = require('form-data');

const token = fs.readFileSync('token.txt', 'utf8').trim();

module.exports = {
  name: 'morphic',
  description: 'Interact with the Morphic AI and receive text and image responses.',
  author: 'coffee',
  usage: '-morphic [query]',

  async execute(senderId, args) {
    if (!Array.isArray(args) || args.length === 0) {
      return sendError(senderId, 'Error: Missing input!');
    }

    const input = args.join(' ').trim();
    await handleMorphicResponse(senderId, input);
  },
};

const handleMorphicResponse = async (senderId, query) => {
  const formData = new FormData();
  formData.append("1", JSON.stringify({ id: "6399a7e212fa477d1a783edade27c8354a64e1ab", bound: null }));
  formData.append("2", JSON.stringify({ id: "9eed8f3e1c51044505fd5c0d73e8d2a92572691c", bound: null }));
  formData.append("3_input", query);
  formData.append("3_include_images", "true");
  formData.append("0", JSON.stringify([
    { action: "$F1", options: { onSetAIState: "$F2" } },
    { chatId: "9TI931x", messages: [] },
    "$K3", false, "$undefined", "$undefined"
  ]));

  try {
    const { data } = await axios.post("https://www.morphic.sh/", formData, {
      headers: {
        ...formData.getHeaders(),
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
        Accept: "text/x-component",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Referer: "https://www.morphic.sh/",
        "Next-Action": "c54d85c7f9588581807befbe1a35958acc57885b",
        "Next-Router-State-Tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2F%22%2C%22refresh%22%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
        Origin: "https://www.morphic.sh",
        Connection: "close",
        Cookie: "ph_phc_HK6KqP8mdSmxDjoZtHYi3MW8Kx5mHmlYpmgmZnGuaV5_posthog=%7B%22distinct_id%22%3A%220191839d-890a-7a97-b388-bc7191ac7047%22%2C%22%24sesid%22%3A%5B1724490025781%2C%220191839d-8909-72e8-b586-d66ff3bde34f%22%2C1724490025225%5D%7D",
        Priority: "u=0",
        TE: "trailers",
      }
    });

    const cleanedText = extractResponseText(data);
    const formattedMessage = `🗨️ | Morphic AI\n・───────────・\n${cleanedText}\n・──── >ᴗ< ────・`;
    await sendMessage(senderId, { text: formattedMessage }, token);
  } catch (error) {
    console.error('Error processing Morphic AI response:', error.message);
    sendError(senderId, 'Error: Unable to process your request.');
  }
};

const extractResponseText = (data) => {
  const regex = /"diff":0,"([^"]+)"|"curr":"([^"]+)"/g;
  let result;
  let text = "";

  while ((result = regex.exec(data)) !== null) {
    text += result[1] || result[2] || "";
  }

  return text.replace(/\$undefined/g, '');
};

const sendError = async (senderId, errorMessage) => {
  await sendMessage(senderId, { text: errorMessage }, token);
};