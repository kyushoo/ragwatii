// splitMessage.js
const MAX_MESSAGE_LENGTH = 2000;  // Max characters allowed per message

function splitMessage(message) {
    const messageChunks = [];
    let start = 0;
    while (start < message.length) {
        const end = start + MAX_MESSAGE_LENGTH;
        messageChunks.push(message.slice(start, end));
        start = end;
    }
    return messageChunks;
}

module.exports = splitMessage;