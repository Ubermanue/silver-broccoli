const fetch = require('node-fetch');
const { sendMessage } = require('../handles/sendMessage');

async function query(data) {
    const token = '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';
    const response = await fetch(
        "https://api-inference.huggingface.co/models/Shakker-Labs/FLUX.1-dev-LoRA-One-Click-Creative-Template",
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.blob();
    return result;
}

module.exports = {
    name: 'imagegen',
    description: 'Generate images using Hugging Face API',
    usage: '-imagegen <prompt>',
    author: 'coffee',
    async execute(senderId, args, pageAccessToken) {
        if (!args || !Array.isArray(args) || args.length === 0) {
            await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
            return;
        }

        const prompt = args.join(' ');

        try {
            const imageBlob = await query({ "inputs": prompt });

            // Convert blob to base64
            const arrayBuffer = await imageBlob.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString('base64');
            const imageUrl = `data:${imageBlob.type};base64,${base64Image}`;

            // Send the image as an attachment
            await sendMessage(senderId, {
                attachment: {
                    type: 'image',
                    payload: {
                        url: imageUrl,
                        is_reusable: true
                    }
                }
            }, pageAccessToken);

        } catch (error) {
            console.error('Error:', error);
            await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
        }
    }
};