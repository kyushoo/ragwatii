const axios = require('axios');

module.exports = {
	name: 'ai',
	description: 'Interact with Xaoai.',
	usage: 'direct chat.',
	author: 'KALIX AO',

	async execute(senderId, args, pageAccessToken, sendMessage) {
		const userInput = args.join(' ');
		try {
			// Primary and fallback URLs
			const primaryUrl = `https://api.y2pheq.me/xaoaibeta?prompt=${encodeURIComponent(
				userInput,
			)}&uid=${senderId}`;
			const fallbackUrl = `https://api.y2pheq.me/xaoai?prompt=${encodeURIComponent(
				userInput,
			)}&uid=${senderId}`;

			let response;
			try {
				response = await axios.get(primaryUrl);
			} catch (primaryError) {
				try {
					response = await axios.get(fallbackUrl);
				} catch (fallbackError) {
					console.error(
						`Error fetching from both APIs:`,
						primaryError,
						fallbackError,
					);
					sendMessage(
						senderId,
						{text: 'Failed to fetch data: API Error.'},
						pageAccessToken,
					);
					return; // Stop execution to avoid sending another message below
				}
			}

			let xaoaiResponse =
				response.data.result || 'Failed to fetch data: API Error.';
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
