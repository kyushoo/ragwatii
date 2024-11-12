const { XaoaiLYRICS } = require('../utils/XaoaiAPI');

async function handleXaoaiRequest(query, senderId, pageAccessToken, sendMessage) {
  try {
    const response = await XaoaiLYRICS(query);

    if (!response || typeof response !== 'string') {
      throw new Error("Invalid response from XaoaiAPI");
    }

    const maxMessageLength = 2000;
    if (response.length > maxMessageLength) {
      splitMessageIntoChunks(response, maxMessageLength).forEach(message => {
        sendMessage(senderId, { text: message }, pageAccessToken);
      });
    } else {
      sendMessage(senderId, { text: response }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error handling Xaoai request:', error);
    sendMessage(senderId, { text: "Error contacting Xaoai API. Please try again later." }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'lyrics',
  description: 'Fetch song lyrics.',
  usage: '.lyrics [song title]',
  author: 'Y2PHEQ (KALIX AO)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');
    await handleXaoaiRequest(query, senderId, pageAccessToken, sendMessage);
  }
};