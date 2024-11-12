const axios = require('axios');
const fs = require('fs');
const fsp = require('fs').promises;

module.exports = {
	name: 'winrar',
	description: 'Winrar License Key Generator',
	author: 'KALIX AO [API BY KENLIE]',
	async execute(
		senderId,
		args,
		pageAccessToken,
		sendMessage,
		messageAttachments,
	) {
		// Extract user input after "winrar" command
		const userInput = args.join('');

		let name = userInput;

		// If no user input, fetch a random name from the API
		if (!name) {
			try {
				const randomUserResponse = await axios.get(
					'https://randomuser.me/api/?results=1&inc=name',
				);
				name = randomUserResponse.data.results[0].name.first; // Get the first name from the response
			} catch (error) {
				console.error('Error fetching random user name:', error);
				await sendMessage(
					senderId,
					{text: 'Unknown Error.'},
					pageAccessToken,
				);
				return;
			}
		}

		const apiUrl = `https://winrar.kenliejugarap.com/gen?user=${name}&license=${name}`;

		try {
			// Inform the user that the process is starting

			// Make the API call to generate the license key
			const response = await axios.get(apiUrl);
			const keyData = response.data.key;

			// Send the key data value back to the user
			await sendMessage(senderId, {text: keyData}, pageAccessToken);

			// Create a temporary rarreg.key file with the license data
			const tempFilePath = `rarreg_${Date.now()}.key`;
			await fsp.writeFile(tempFilePath, keyData);

			// Send the rarreg.key file as a stream
			await sendMessage(
				senderId,
				{
					attachment: {
						type: 'file',
						payload: {},
					},
					filedata: fs.createReadStream(tempFilePath), // Send as a file stream
				},
				pageAccessToken,
			);

			// Clean up the file after sending
			await fsp.unlink(tempFilePath);
		} catch (error) {
			console.error(`Error executing ${this.name} command:`, error);
			await sendMessage(
				senderId,
				{text: `Failed to run this command: ${this.name}.`},
				pageAccessToken,
			);
		}
	},
};
