const axios = require('axios');

module.exports = {
	name: 'ai',
	description: 'Interact with Xaoai.',
	usage: 'direct chat.',
	author: 'KALIX AO',

	async execute(senderId, args, pageAccessToken, sendMessage) {
		const userInput = args.join(' ');
		try {
			const apiUrl = `https://api.y2pheq.me/xaoai?prompt=${encodeURIComponent(
				userInput,
			)}&uid=${senderId}`;

			let xaoaiResponse =
				apiUrl.data.result || 'Failed to fetch data: API Error.';
			xaoaiResponse = xaoaiResponse.replace(/(\*\*|\*|```|_|~|>)/g, '');
			sendMessage(
				senderId,
				{
					text: xaoaiResponse,
				},
				pageAccessToken,
			);
		} catch (error) {
			console.error(`Error executing ${this.name} command:`, error);
			sendMessage(
				senderId,
				{
					text: 'Failed to fetch data: API Error.',
				},
				pageAccessToken,
			);
		}
	},
};
