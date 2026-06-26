const twilio = require('twilio');

const sendSMS = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('⚠️ Twilio credentials are not fully configured in .env. SMS will not be sent.');
    console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    console.log(`[SMS SENDER] ✅ SMS sent successfully to ${to} (SID: ${response.sid})`);
  } catch (error) {
    console.error(`[SMS SENDER] ❌ Failed to send SMS to ${to}:`, error.message);
    // Don't throw the error to prevent app crash if SMS fails
  }
};

module.exports = sendSMS;
