const axios = require('axios');
const xaoai = require('@y2pheq/xaoai');

const ai = new xaoai();

async function XaoaiAPI(query, sid) {
  try {
    const response = await ai.xviii(query, sid);
    console.log("Message sent successfully. Response:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

async function XaoaiLYRICS(query) {
  try {
    const response = await ai.lyrics(query);
    console.log("Message sent successfully. Response:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

module.exports = { XaoaiAPI, XaoaiLYRICS };