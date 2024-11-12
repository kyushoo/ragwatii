
const cooldown = {}; // empty object

const cooldownData = {};

cooldown.addCooldown = (senderId, time) => {
   cooldownData[senderId] = Date.now() + (time * 1000); // 25 seconds in milliseconds
}


cooldown.checkCooldown = (senderId, time) => {
  if (cooldownData[senderId] && cooldownData[senderId] > Date.now()) {
    return true;  // On cooldown
  } else {
    return false; // Not on cooldown
  }
}


module.exports = cooldown;