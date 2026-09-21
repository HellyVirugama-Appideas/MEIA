// Generates a numeric OTP of configurable length (default 4 digits, matches Figma OTP screens)

const generateOTP = () => {
  const length = parseInt(process.env.OTP_LENGTH || "4", 10);
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
};

module.exports = generateOTP;
