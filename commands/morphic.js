const axios = require('axios');
const FormData = require('form-data');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'morphic',
  description: 'Get a response from Morphic API.',
  author: 'yourname',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, 'Error: Please provide a query.', pageAccessToken);
    }

    const input = args.join(' ').trim();
    try {
      const response = await morphic(input);
      await sendMessage(senderId, { text: response }, pageAccessToken);
    } catch (error) {
      console.error('Error fetching response from Morphic:', error);
      await sendError(senderId, 'Error: Unexpected error occurred while fetching the response.', pageAccessToken);
    }
  },
};

async function morphic(query) {
  const formData = new FormData();
  formData.append("1", JSON.stringify({
    id: "6399a7e212fa477d1a783edade27c8354a64e1ab",
    bound: null
  }));
  formData.append("2", JSON.stringify({
    id: "9eed8f3e1c51044505fd5c0d73e8d2a92572691c",
    bound: null
  }));
  formData.append("3_input", query);
  formData.append("3_include_images", "true");
  formData.append("0", JSON.stringify([{
    action: "$F1",
    options: {
      onSetAIState: "$F2"
    }
  }, {
    chatId: "9TI931x",
    messages: []
  }, "$K3", false, "$undefined", "$undefined"]));

  try {
    const response = await axios.post("https://www.morphic.sh/", formData, {
      headers: {
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
        ...formData.getHeaders()
      }
    });

    const data = response.data;
    const regex = /"diff":$$0,"([^"]+)"$$|"curr":"([^"]+)"/g;
    let result;
    let text = "";
    while ((result = regex.exec(data)) !== null) {
      if (result[1]) {
        text += result[1];
      } else if (result[2]) {
        text += result[2];
      }
    }
    const cleaned = text.replace(/\$undefined/g, '');
    return cleaned;
  } catch (e) {
    console.error(e.message);
    throw e;
  }
}

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};