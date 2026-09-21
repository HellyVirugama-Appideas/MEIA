const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Guard: don't crash app if Twilio creds are missing in local/dev testing
let client = null;
if (accountSid && authToken && accountSid.startsWith("AC")) {
  client = twilio(accountSid, authToken);
} else {
  console.warn(
    "[Twilio] Credentials not set properly. OTP SMS sending will be mocked/logged to console."
  );
}

module.exports = client;
