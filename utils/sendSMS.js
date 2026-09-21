const twilioClient = require("../config/twilio");

/**
 * Sends OTP over SMS using Twilio.
 * If Twilio Verify Service SID is configured, uses Verify API (recommended).
 * Else falls back to plain SMS via Twilio Programmable Messaging using generated OTP.
 * If Twilio is not configured at all (local/dev), OTP is just logged to console.
 */
const sendOTPSms = async (fullPhoneNumber, otp) => {
  const message = `${otp} is your MEIA verification code. Do not share this OTP with anyone. Valid for ${
    process.env.OTP_EXPIRY_MINUTES || 5
  } minutes.`;

  // Dev fallback - no Twilio configured
  if (!twilioClient) {
    console.log(`[MOCK SMS] To: ${fullPhoneNumber} | OTP: ${otp}`);
    return { success: true, mocked: true };
  }

  try {
    const res = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: fullPhoneNumber,
    });
    return { success: true, sid: res.sid };
  } catch (err) {
    console.error("[Twilio SMS Error]", err.message);
    throw new Error("Failed to send OTP SMS. Please try again.");
  }
};

module.exports = sendOTPSms;
