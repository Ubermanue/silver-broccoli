const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const tokenPath = './token.txt';
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

const API_KEY = 'AIzaSyC_gYM4M6Fp1AOYra_K_-USs0SgrFI08V0';
const SEARCH_ENGINE_ID = 'e01c6428089ea4702';
const MAX_IMAGES = 9;

module.exports = {
  name: 'gmage',
  description: 'Search Google Images.',
  usage: '-gmage <search_query>',
  author: 'coffee',

  async execute(senderId, args) {
    if (!args || args.length === 0) {
      return sendMessage(senderId, { text: '📷 | Follow this format:\n-gmage naruto uzumaki' }, pageAccessToken);
    }

    // Get the search query from the arguments
    const searchQuery = args.join(' ').trim();

    try {
      const imageUrls = await fetchImageUrls(searchQuery, MAX_IMAGES);

      if (imageUrls.length === 0) {
        return sendMessage(senderId, { text: `📷 | No images found for "${searchQuery}".` }, pageAccessToken);
      }

      // Send each image as an attachment in separate messages
      for (const url of imageUrls) {
        await sendImage(senderId, url, pageAccessToken);
      }

    } catch (error) {
      console.error('Error:', error);
      sendMessage(senderId, { text: '📷 | Can\'t get your images atm, do try again later...' }, pageAccessToken);
    }
  }
};

// Fetch image URLs from Google Custom Search API
async function fetchImageUrls(query, count) {
  const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image`;
  const { data } = await axios.get(apiUrl);
  return data.items ? data.items.slice(0, count).map(item => item.link) : [];
}

// Send image as an attachment
async function sendImage(senderId, url, pageAccessToken) {
  const attachment = {
    type: 'image',
    payload: { url }
  };
  return sendMessage(senderId, { attachment }, pageAccessToken);
}