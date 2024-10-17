const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Read the token from the file
const token = fs.readFileSync('token.txt', 'utf8');

// Define header and footer
const header = '・──── >ᴗ< ────・';
const footer = '・───────────・';

// Language codes mapped to full names
const langNames = {
    "sq": "Albanian",
    "af": "Afrikaans",
    "ar": "Arabic",
    "bn": "Bengali",
    "bs": "Bosnian",
    "my": "Burmese",
    "ca": "Catalan",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "et": "Estonian",
    "fil": "Filipino",
    "fi": "Finnish",
    "fr": "French",
    "de": "German",
    "el": "Greek",
    "gu": "Gujarati",
    "hi": "Hindi",
    "hu": "Hungarian",
    "is": "Icelandic",
    "id": "Indonesian",
    "it": "Italian",
    "ja": "Japanese",
    "kn": "Kannada",
    "km": "Khmer",
    "ko": "Korean",
    "la": "Latin",
    "lv": "Latvian",
    "ml": "Malayalam",
    "mr": "Marathi",
    "ne": "Nepali",
    "nb": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sr": "Serbian",
    "si": "Sinhalese",
    "sk": "Slovak",
    "es": "Spanish",
    "sw": "Swahili",
    "sv": "Swedish",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese"
};

const supportedLangs = Object.keys(langNames);

module.exports = {
    name: 'gtranslate',
    description: 'Translate text with Google Translate.',
    author: 'Coffee',

    async execute(senderId, args) {
        const pageAccessToken = token;

        // Check if no arguments were provided
        if (args.length === 0) {
            const tutorialMessage = `${header}\nHow to use the gtranslate command:\n\n1. Specify a target language code (e.g., 'es' for Spanish).\n2. Enter the text you want to translate.\n\nExample: -gtranslate es Hello, how are you?\nResult: Hola, ¿cómo estás?\n\nTo view other supported languages, type -gtranslate language list.\n${footer}`;
            return await sendMessage(senderId, { text: tutorialMessage }, pageAccessToken);
        }

        // Check if the user requested the language list
        if (args[0].toLowerCase() === 'language' && args[1] === 'list') {
            const languageList = Object.entries(langNames)
                .map(([code, name]) => `${code}: ${name}`)
                .join('\n');

            const languageMessage = `${header}\nSupported languages:\n${languageList}\n${footer}`;
            return await sendMessage(senderId, { text: languageMessage }, pageAccessToken);
        }

        // Extract the language code and the text from the arguments
        const langInput = args[0]?.toLowerCase();
        const targetLang = supportedLangs.includes(langInput) ? langInput : "en";
        const text = langInput ? args.slice(1).join(' ') : args.join(' ');

        if (!text) {
            return await sendMessage(senderId, { text: `${header}\nPlease provide the text you want to translate.\n${footer}` }, pageAccessToken);
        }

        // Google Translate API URL
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

        try {
            // Make the API call
            const response = await axios.get(url);
            const translation = response.data[0].map(item => item[0]).join('');
            const langFrom = response.data[2];
            const fromName = langNames[langFrom] || langFrom;
            const toName = langNames[targetLang] || targetLang;

            const formattedMessage = `${header}\nTranslated from ${fromName} to ${toName}\n\n🪧 Translated text:\n▫️${translation}\n${footer}`;

            // Send the translated message
            await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
        } catch (error) {
            console.error('Translation Error:', error);
            await sendMessage(senderId, { text: `${header}\nError: Unable to translate the text at this time. Please try again later.\n${footer}` }, pageAccessToken);
        }
    }
};