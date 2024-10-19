const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const FormData = require('form-data');

const token = fs.readFileSync('token.txt', 'utf8').trim();

module.exports = {
  name: 'morphic',
  description: 'Interact with the Morphic AI and receive text and image responses.',
  usage: '-morphic <query>',
  author: 'coffee',

  async execute(senderId, args) {
    // Default to "hi" if no query is provided
    const prompt = (args.join(' ') || 'hi').trim();
    
    // Prepare the request to Morphic AI
    const formData = new FormData();
    formData.append("1", JSON.stringify({ id: "6399a7e212fa477d1a783edade27c8354a64e1ab", bound: null }));
    formData.append("2", JSON.stringify({ id: "9eed8f3e1c51044505fd5c0d73e8d2a92572691c", bound: null }));
    formData.append("3_input", prompt);
    formData.append("3_include_images", "true");
    formData.append("0", JSON.stringify([
      { action: "$F1", options: { onSetAIState: "$F2" } },
      { chatId: "9TI931x", messages: [] },
      "$K3", false, "$undefined", "$undefined"
    ]));

    const header = '🗨️ | Morphic AI\n・───────────・\n';
    const footer = '\n・──── >ᴗ< ────・';

    try {
      const { data } = await axios.post("https://www.morphic.sh/", formData, {
        headers: {
          ...formData.getHeaders(),
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
          Accept: "text/x-component",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          Referer: "https://www.morphic.sh/",
          Origin: "https://www.morphic.sh",
          Connection: "close",
        }
      });

      // Extract response text and image URLs
      const responseText = extractResponseText(data);
      const imgUrls = extractImageUrls(data);

      // Handle image responses
      if (imgUrls.length > 0) {
        for (const imgUrl of imgUrls) {
          const attachment = {
            type: 'image',
            payload: { url: imgUrl }
          };
          await sendMessage(senderId, { attachment }, token);
        }
      }

      // Send the text response
      const formattedMessage = `${header}${responseText}${footer}`;
      await sendMessage(senderId, { text: formattedMessage }, token);

    } catch (error) {
      console.error('Error processing Morphic AI response:', error.message);
      const errorMessage = `${header}Error: Unable to process your request.${footer}`;
      await sendMessage(senderId, { text: errorMessage }, token);
    }
  },
};

// Extracts response text using regex
const extractResponseText = (data) => {
  const regex = /"diff":0,"([^"]+)"|"curr":"([^"]+)"/g;
  let result;
  let text = "";

  while ((result = regex.exec(data)) !== null) {
    text += result[1] || result[2] || "";
  }

  return text.replace(/\$undefined/g, '');
};

// Extracts image URLs (modify this based on actual data structure)
const extractImageUrls = (data) => {
  const regex = /"img_url":"([^"]+)"/g; // Adjust regex based on actual response format
  let result;
  const urls = [];

  while ((result = regex.exec(data)) !== null) {
    urls.push(result[1]);
  }

  return urls;
};