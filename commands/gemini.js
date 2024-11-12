const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
	name: 'pic',
	description: 'Interact with AI for text and image analysis',
	usage: '/pic <your question>',
	author: 'KALIX AO',
	async execute(senderId, args, pageAccessToken, sendMessage) {
		const prompt = args.join(' ');

		// Maintain conversation history per user (replace with a suitable persistent store if needed)
		const conversationHistory = new Map(); // Or use a database for persistence
		const history = conversationHistory.get(senderId) || [];

		try {
			const response = await queryGemini(
				prompt,
				null,
				history,
				process.env.GEMINI_API_KEY,
			); // Assuming you set GEMINI_API_KEY as an environment variable

			// Update conversation history
			history.push({role: 'user', parts: [{text: prompt}]});
			history.push({role: 'model', parts: [{text: response}]});
			conversationHistory.set(senderId, history.slice(-10)); // Keep last 10 messages

			sendMessage(
				senderId,
				{
					text: response,
				},
				pageAccessToken,
			);
		} catch (error) {
			console.error('Error:', error);
			sendMessage(
				senderId,
				{
					text: 'There was an error processing your request.',
				},
				pageAccessToken,
			);
		}
	},
};

async function queryGemini(question, imageContent, history, apiKey) {
	const API_URL =
		'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
	const payload = {
		contents: [
			...history,
			{
				role: 'user',
				parts: [
					{text: question},
					...(imageContent
						? [
								{
									inline_data: {
										mime_type: 'image/jpeg',
										data: imageContent,
									},
								},
						  ]
						: []),
				],
			},
		],
	};

	try {
		const response = await axios.post(`${API_URL}?key=${apiKey}`, payload, {
			headers: {'Content-Type': 'application/json'},
		});

		return response.data.candidates[0].content.parts[0].text;
	} catch (error) {
		console.error(
			'Error querying Gemini API:',
			error.response?.data || error.message,
		);
		throw new Error('Failed to get a response from Gemini API');
	}
}
