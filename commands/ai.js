const axios = require('axios');

module.exports = {
	name: 'ai',
	description: 'Interact with Xaoai.',
	usage: 'direct chat or image upload.',
	author: 'KALIX AO',

	async execute(
		senderId,
		args,
		pageAccessToken,
		sendMessage,
		messageAttachments,
	) {
		const userInput = args.join(' ');

		try {
			if (messageAttachments && messageAttachments.length > 0) {
				const imageUrl = messageAttachments[0].payload.url; // Assuming the image URL is in this structure

				// Now reply to the user to inform them to wait while processing
				await sendMessage(
					senderId,
					{text: 'Analyzing image...'},
					pageAccessToken,
				);

				// Call the image to text API
				try {
					const imageRecog = await axios.get(
						`https://api.kenliejugarap.com/pixtral-paid/?question=describe this image&image_url=${imageUrl}`,
					);
					const resp = imageRecog.data.response; // Assuming the response has a text field

					// Send the extracted text back to the user
					await sendMessage(senderId, {text: resp}, pageAccessToken);
				} catch (error) {
					console.error(
						'Error extracting text from image:',
						error.message,
					);
					await sendMessage(
						senderId,
						{text: 'Failed to fetch data: API Error.'},
						pageAccessToken,
					);
				}
			} else {
				// Text-based AI interaction
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
					response.data.result || 'Failed to fetch response.';
				xaoaiResponse = xaoaiResponse.replace(
					/(\*\*|\*|```|_|~|>)/g,
					'',
				);
				sendMessage(senderId, {text: xaoaiResponse}, pageAccessToken);
			}
		} catch (error) {
			console.error(`Error executing ${this.name} command:`, error);
			sendMessage(
				senderId,
				{text: 'An error occurred.'},
				pageAccessToken,
			);
		}
	},
};
