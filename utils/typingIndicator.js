const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || fs.readFileSync('token.txt', 'utf8').trim();

const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

async function typingIndicator(senderId, action) {
    try {
        await axios.post(url, {
            recipient: { id: senderId },
            sender_action: action
        });
     //   console.log(`Typing indicator '${action}' sent successfully.`);
    } catch (error) {
        console.error('Error sending typing indicator:', error.response ? error.response.data : error.message);
    }
}

module.exports = { typingIndicator };