const fs = require('fs/promises');
const path = require('path');

module.exports = {
  name: 'email',
  description: 'Generate temp mail, check for new messages, and view history.',
  usage: 'email [generate|message|history]',
  author: 'KALIX AO',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const apiUrlBase = 'https://www.1secmail.com/api/v1/?action=';
    const emailsFilePath = path.join(__dirname, '..', 'data', 'emails.json');

    async function generateEmail(retries = 0) {
      try {
        const generateResponse = await fetch(`${apiUrlBase}genRandomMailbox&count=1`);
        const generateData = await generateResponse.json();
        const email = generateData[0];

        if (email.includes("dpptd.com")) {
          if (retries < 6) {
            console.log("Email with dpptd.com detected. Retrying...", retries);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
            return generateEmail(retries + 1);
          } else {
            console.error("Reached maximum retry attempts for email generation.");
            throw new Error("Failed to generate a valid email address after multiple retries.");
          }
        }
        return email;
      } catch (error) {
        console.error("Error generating email:", error);
        throw error; // Re-throw to be caught by the outer try-catch
      }
    }

    try {
      let emailData = {};
      try {
        const emailDataRaw = await fs.readFile(emailsFilePath, 'utf-8');
        emailData = JSON.parse(emailDataRaw);
      } catch (e) {}

      if (!emailData[senderId]) {
        emailData[senderId] = {
          email: null,
          emailHistory: []
        };
      }

      if (args[0] === 'generate') {
        const email = await generateEmail();
        emailData[senderId].email = email;

        sendMessage(senderId, {
          text: `${emailData[senderId].email}`
        }, pageAccessToken);
        await fs.writeFile(emailsFilePath, JSON.stringify(emailData, null, 2));
      } else if (args[0] === 'message') {
        const email = emailData[senderId].email;
        if (!email) {
          sendMessage(senderId, {
            text: 'Please generate an email first using `email generate`.'
          }, pageAccessToken);
          return;
        }
        const login = emailData[senderId].email.split('@')[0];
        const domain = emailData[senderId].email.split('@')[1];
        const checkAndHandleNewMessages = async () => {
          try {
            const checkResponse = await fetch(`${apiUrlBase}getMessages&login=${login}&domain=${domain}`);
            const checkData = await checkResponse.json();

            const newMessages = checkData.filter(msg => !emailData[senderId].emailHistory.some(storedMsg => storedMsg.id === msg.id));

            if (newMessages.length > 0) {
              newMessages.forEach(msg => {
                emailData[senderId].emailHistory.push(msg);
                // Improved message formatting (handles missing body)
                let messageBody = checkData.body || 'No body found.';
                sendMessage(senderId, {
                  text: `NEW MESSAGE RECEIVED!\n\nSUBJECT: ${msg.subject}\nFROM: ${msg.from}\n\nMESSAGE BODY:\n${messageBody}`
                }, pageAccessToken);
              });
              await fs.writeFile(emailsFilePath, JSON.stringify(emailData, null, 2));
            } else {
              // Check periodically for new messages
              setTimeout(checkAndHandleNewMessages, 5000); // Check every 5 seconds (adjust as needed)
            }
          } catch (error) {
            console.error('Error checking for new messages:', error);
            // Important: Retry checking after an error
            setTimeout(checkAndHandleNewMessages, 5000); // Retry after 5 seconds
          }
        };

        // Initial check for new messages.
        checkAndHandleNewMessages();
      } else if (args[0] === 'history') {
        if (emailData[senderId].emailHistory.length === 0) {
          sendMessage(senderId, {
            text: 'No email history yet.'
          }, pageAccessToken);
        } else {
          emailData[senderId].emailHistory.forEach((msg, index) => {
            sendMessage(senderId, {
              text: `INBOX [${index+1}].\n\nSUBJECT: ${msg.subject}\nFROM: ${msg.from}`
            }, pageAccessToken);
          });
        }
      } else {
        sendMessage(senderId, {
          text: module.exports.usage
        }, pageAccessToken);
      }
      // Save email data after any operation
      await fs.writeFile(emailsFilePath, JSON.stringify(emailData, null, 2));
    } catch (error) {
      // ... (Error handling)
    }
  }
};