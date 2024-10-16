const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

const fontMaps = [
  {
    name: 'fancy',
    map: {
      ' ': ' ',
      'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': '𝑒', 'f': '𝒻', 'g': '𝑔', 'h': '𝒽',
      'i': '𝒾', 'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': '𝑜', 'p': '𝓅', 'q': '𝓆',
      'r': '𝓇', 's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏',
      'A': '𝒜', 'B': '𝐵', 'C': '𝒞', 'D': '𝒟', 'E': '𝐸', 'F': '𝐹', 'G': '𝒢', 'H': '𝐻',
      'I': '𝐼', 'J': '𝒥', 'K': '𝒦', 'L': '𝐿', 'M': '𝑀', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬',
      'R': '𝑅', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵',
    },
  },
  {
    name: 'cursive',
    map: {
      ' ': ' ',
      'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱',
      'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹', 'q': '𝓺',
      'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁', 'y': '𝔂', 'z': '𝔃',
      'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗',
      'I': '𝓘', 'J': '𝓙', 'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟', 'Q': '𝓠',
      'R': '𝓡', 'S': '𝓢', 'T': '𝓣', 'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩',
    },
  },
  // Add more fonts as needed
];

module.exports = {
  name: 'font',
  description: 'Convert text to different fonts',
  author: 'Your Name',
  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a font type and message. Example: -font fancy Hello!' }, pageAccessToken);
      return;
    }

    const command = args[0].toLowerCase();

    // Font listing feature
    if (command === 'list') {
      const exampleText = 'Hello';
      const header = '═「𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐅𝐨𝐧𝐭𝐬 」═\n\n 𝑭𝒐𝒏𝒕 𝑵𝒂𝒎𝒆     𝑺𝒂𝒎𝒑𝒍𝒆';
      const maxFontNameLength = Math.max(...fontMaps.map(fontMap => fontMap.name.length));

      const availableFontsList = fontMaps.map((fontMap) => {
        const exampleChar = exampleText.split('')
          .map((char) => fontMap.map[char] || char)
          .join('');

        const formattedFontName = `★ ${fontMap.name.padEnd(maxFontNameLength)}`;
        const padding = ' '.repeat(maxFontNameLength - fontMap.name.length);

        return `${formattedFontName}${padding}     ${exampleChar}`;
      }).join('\n');

      const message = `${header}\n\n${availableFontsList}`;
      await sendMessage(senderId, { text: message }, pageAccessToken);
      return;
    }

    if (args.length < 2) {
      await sendMessage(senderId, { text: 'Invalid usage. Please provide a font type and message.\nExample: -font fancy Hello!\nUse -font list to see available fonts.' }, pageAccessToken);
      return;
    }

    const fontType = args.shift().toLowerCase();
    const inputText = args.join(' ');

    const chosenFontMap = fontMaps.find((fontMap) => fontMap.name === fontType);

    if (!chosenFontMap) {
      const availableFonts = fontMaps.map((fontMap) => `★ ${fontMap.name}`).join('\n');
      await sendMessage(senderId, { text: `Invalid font type. Available fonts:\n${availableFonts}` }, pageAccessToken);
      return;
    }

    const outputText = inputText
      .split('')
      .map((char) => chosenFontMap.map[char] || char)
      .join('');

    const formattedMessage = `・───────────・\n${outputText}\n・──── >ᴗ< ────・`;

    try {
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};