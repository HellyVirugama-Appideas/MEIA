const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const generateOTP = require("../../utils/generateOTP");
const generateToken = require("../../utils/generateToken");
const sendOTPSms = require("../../utils/sendSMS");
const { success, error } = require("../../utils/response");
const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10);

/* ------------------------------------------------------------------ */
/*  Strong password validation (matches Figma rules)                  */
/* ------------------------------------------------------------------ */
const isStrongPassword = (password) => {
  // 8+ chars, 1 uppercase, 1 number, 1 special character
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return regex.test(password);
};  

const issueOTP = async (user, purpose) => {
  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  user.otpPurpose = purpose;
  await user.save();

  const fullPhone = `${user.countryCode}${user.phone}`;
  await sendOTPSms(fullPhone, otp);

  return otp;
};

/* ------------------------------------------------------------------ *
 *  SIGNUP now runs AFTER onboarding is complete.                     *
 *  Route is protected with the GUEST token that was issued by        *
 *  POST /api/onboarding/start, so req.user here is the SAME user     *
 *  document that already holds all the onboarding data               *
 *  (birthInfo, cycleInfo, personalization, etc). We just attach a    *
 *  phone number to it and send an OTP - no new user is created.      *
 * ------------------------------------------------------------------ */

// exports.signup = async (req, res, next) => {
//   try {
//     const { phone, countryCode } = req.body;

//     if (!phone) {
//       return error(res, "Phone number is required.", 422);
//     }

//     const user = req.user; // the guest user created at onboarding /start

//     if (user.isPhoneVerified && user.isMpinSet) {
//       return error(
//         res,
//         "This account is already fully set up. Please sign in.",
//         409
//       );
//     }

//     // Make sure this phone isn't already used by a different,
//     // fully-registered account
//     const existing = await User.findOne({
//       phone,
//       countryCode: countryCode || "+91",
//       _id: { $ne: user._id },
//       isPhoneVerified: true,
//       isMpinSet: true,
//     });

//     if (existing) {
//       return error(
//         res,
//         "An account with this phone number and country code already exists. Please sign in.",
//         409
//       );
//     }

//     user.phone = phone;
//     user.countryCode = countryCode || "+91";

//     await user.save();

//     // OTP generate aur send karo
//     const otpResponse = await issueOTP(user, "signup");

//     return success(
//       res,
//       "OTP sent to your phone number for verification.",
//       {
//         userId: user._id,
//         phone: user.phone,
//         countryCode: user.countryCode,
//         otp: otpResponse?.otp || user.otp,
//       },
//       201
//     );
//   } catch (err) {
//     next(err);
//   }
// };

exports.signup = async (req, res, next) => {
  try {
    const { phone, countryCode } = req.body;

    if (!phone) {
      return error(res, "Phone number is required.", 422);
    }

    const user = req.user; // the guest user created at onboarding /start

    if (user.isPhoneVerified && user.isMpinSet) {
      return error(
        res,
        "This account is already fully set up. Please sign in.",
        409
      );
    }

    // Make sure this phone isn't already used by a different,
    // fully-registered account
    const existing = await User.findOne({
      phone,
      countryCode: countryCode || "+91",
      _id: { $ne: user._id },
      isPhoneVerified: true,
      isMpinSet: true,
    });

    if (existing) {
      return error(
        res,
        "An account with this phone number and country code already exists. Please sign in.",
        409
      );
    }

    // FIX: the check above only catches *fully verified* accounts, but the
    // phone field has a hard unique index in MongoDB regardless of
    // verification status. A stale/abandoned guest (someone who started
    // onboarding, attached this same phone, then never finished OTP+MPIN)
    // would slip past the check above and then crash user.save() below
    // with a raw E11000 duplicate-key error - which is what was surfacing
    // as an unhandled 500 on re-signup. Since that other account never
    // completed signup, it's safe to release the phone from it here.
    const staleGuest = await User.findOne({
      phone,
      countryCode: countryCode || "+91",
      _id: { $ne: user._id },
      $or: [{ isPhoneVerified: false }, { isMpinSet: false }],
    });

    if (staleGuest) {
      staleGuest.phone = undefined;
      staleGuest.countryCode = undefined;
      await staleGuest.save();
    }

    user.phone = phone;
    user.countryCode = countryCode || "+91";

    await user.save();

    // OTP generate aur send karo
    const otpResponse = await issueOTP(user, "signup");

    return success(
      res,
      "OTP sent to your phone number for verification.",
      {
        userId: user._id,
        phone: user.phone,
        countryCode: user.countryCode,
        otp: otpResponse?.otp || user.otp,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};


exports.resendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return error(res, "Phone number is required.", 422);
    }

    const user = await User.findOne({ phone }).select("+otpPurpose");
    if (!user) {
      return error(res, "No account found with this phone number.", 404);
    }

    const purpose = user.otpPurpose || "signup";
    await issueOTP(user, purpose);

    return success(res, "OTP resent successfully.", { phone: user.phone });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return error(res, "Phone and OTP are required.", 422);
    }

    const user = await User.findOne({ phone }).select(
      "+otp +otpExpiresAt +otpPurpose"
    );

    if (!user) {
      return error(res, "No account found with this phone number.", 404);
    }

    if (!user.otp || !user.otpExpiresAt) {
      return error(res, "No OTP was requested. Please request a new OTP.", 400);
    }

    if (user.otpExpiresAt < new Date()) {
      return error(res, "OTP has expired. Please request a new one.", 400);
    }

    if (user.otp !== otp) {
      return error(res, "Invalid OTP. Please try again.", 400);
    }

    const purpose = user.otpPurpose;

    // Clear otp fields after successful verification
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = undefined;

    if (purpose === "signup") {
      user.isPhoneVerified = true;
    }
    await user.save();

    // Short-lived token used ONLY to authorize the next step
    // (set-mpin/confirm-mpin for signup, or set-mpin/confirm-mpin again for forgot-mpin reset)
    const verificationToken = generateToken(user._id);

    return success(res, "OTP verified successfully.", {
      purpose,
      verificationToken,
      isMpinSet: user.isMpinSet,
    });
  } catch (err) {
    next(err);
  }
};


/* ------------------------------------------------------------------ *
 *  SIGNIN – phone + password + countryCode
 * ------------------------------------------------------------------ */
// exports.signin = async (req, res, next) => {
//   try {
//     const { phone, password, countryCode } = req.body;

//     if (!phone || !password) {
//       return error(res, "Phone and password are required.", 422);
//     }

//     // Find user by phone (countryCode is optional, mainly for frontend form)
//     const user = await User.findOne({ phone }).select("+password");

//     if (!user || !user.password) {
//       return error(res, "Invalid phone number or password.", 401);
//     }

//     if (!user.isPhoneVerified) {
//       return error(res, "Please complete signup verification first.", 403);
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return error(res, "Invalid phone number or password.", 401);
//     }

//     // Optionally update countryCode if frontend sends a new one
//     if (countryCode) {
//       user.countryCode = countryCode;
//     }

//     user.lastLoginAt = new Date();
//     await user.save();

//     const token = generateToken(user._id);

//     return success(res, "Login successful.", {
//       token,
//       user: sanitizeUser(user),   // already contains isOnboarded + countryCode
//     });
//   } catch (err) {
//     next(err);
//   }
// };

/* ------------------------------------------------------------------ *
 *  SIGNIN – phone + password + countryCode
 * ------------------------------------------------------------------ */
exports.signin = async (req, res, next) => {
  try {
    const { phone, password, countryCode } = req.body;

    if (!phone || !password) {
      return error(res, "Phone and password are required.", 422);
    }

    // Find user by phone
    const user = await User.findOne({ phone }).select("+password");

    if (!user || !user.password) {
      return error(res, "Invalid phone number or password.", 401);
    }

    // Block deleted accounts
    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (!user.isPhoneVerified) {
      return error(res, "Please complete signup verification first.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return error(res, "Invalid phone number or password.", 401);
    }

    // Optionally update countryCode if frontend sends a new one
    if (countryCode) {
      user.countryCode = countryCode;
    }

    user.lastLoginAt = new Date();

    await user.save();

    const token = generateToken(user._id);

    return success(res, "Login successful.", {
      token,
      user: sanitizeUser(user),
      syncPreference: user.syncPreference,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  CHECK MPIN STATUS -> POST /api/auth/check-mpin                    */
/*  Body: { phone, countryCode }                                      */
/*  Returns whether this account has MPIN set (for app routing)       */
/* ------------------------------------------------------------------ */
exports.checkMpinStatus = async (req, res, next) => {
  try {
    const { phone, countryCode } = req.body;

    if (!phone || !countryCode) {
      return error(res, "Phone number and country code are required.", 422);
    }

    const user = await User.findOne({
      phone,
      countryCode,
    }).select("isMpinSet isPhoneVerified isGuest status");

    // Account hi nahi mila
    if (!user) {
      return success(res, "No account found with this phone number.", {
        exists: false,
        isMpinSet: false,
        isPhoneVerified: false,
      });
    }

    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (user.status === "blocked") {
      return error(res, "This account has been blocked.", 403);
    }

    return success(res, "MPIN status fetched.", {
      exists: true,
      isMpinSet: !!user.isMpinSet,
      isPhoneVerified: !!user.isPhoneVerified,
      isGuest: !!user.isGuest,
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotMpin = async (req, res, next) => {
  try {
    const { phone, countryCode } = req.body;

    if (!phone || !countryCode) {
      return error(
        res,
        "Phone number and country code are required.",
        422
      );
    }

    const user = await User.findOne({
      phone,
      countryCode,
    });

    if (!user) {
      return error(
        res,
        "No account found with this phone number and country code.",
        404
      );
    }

    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (user.status === "blocked") {
      return error(res, "This account has been blocked.", 403);
    }

    if (!user.isPhoneVerified || !user.isMpinSet) {
      return error(
        res,
        "Please complete account setup first.",
        403
      );
    }

    const otpResponse = await issueOTP(user, "forgot_mpin");

    return success(
      res,
      "OTP sent to your registered phone number.",
      {
        phone: user.phone,
        countryCode: user.countryCode,
        otp: otpResponse?.otp || user.otp, // remove in production
      }
    );
  } catch (err) {
    next(err);
  }
};

exports.resetMpin = async (req, res, next) => {
  try {
    const { mpin, confirmMpin } = req.body;

    if (!mpin || !/^\d{4,6}$/.test(mpin)) {
      return error(res, "MPIN must be 4-6 digits.", 422);
    }

    if (!confirmMpin) {
      return error(res, "Please confirm your MPIN.", 422);
    }

    if (mpin !== confirmMpin) {
      return error(
        res,
        "MPIN and Confirm MPIN do not match.",
        400
      );
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return error(res, "User not found.", 404);
    }

    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (!user.isPhoneVerified) {
      return error(
        res,
        "Please verify your phone number first.",
        400
      );
    }

    if (!user.isMpinSet) {
      return error(
        res,
        "MPIN has not been created yet.",
        400
      );
    }

    const hashedMpin = await bcrypt.hash(mpin, 10);

    user.mpin = hashedMpin;
    user.isMpinSet = true;

    await user.save();

    return success(res, "MPIN reset successfully.", {
      isMpinSet: user.isMpinSet,
    });
  } catch (err) {
    next(err);
  }
};

exports.setMpin = async (req, res, next) => {
  try {
    const { mpin, confirmMpin } = req.body;

    if (!mpin || !/^\d{4,6}$/.test(mpin)) {
      return error(res, "MPIN must be 4-6 digits.", 422);
    }

    if (!confirmMpin) {
      return error(res, "Please confirm your MPIN.", 422);
    }

    if (mpin !== confirmMpin) {
      return error(res, "MPIN and Confirm MPIN do not match.", 400);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return error(res, "User not found.", 404);
    }

    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (!user.isPhoneVerified) {
      return error(
        res,
        "Please verify your phone number first.",
        400
      );
    }

    // Hash MPIN before storing
    const hashedMpin = await bcrypt.hash(mpin, 10);

    user.mpin = hashedMpin;
    user.isMpinSet = true;
    user.isProfileComplete = true;
    user.isGuest = false;
    user.lastLoginAt = new Date();

    await user.save();

    const token = generateToken(user._id);

    return success(res, "MPIN created successfully.", {
      token,
      user: sanitizeUser(user),
      nextStep: user.isOnboarded ? "home" : "onboarding",
    });
  } catch (err) {
    next(err);
  }
};

exports.changeMpin = async (req, res, next) => {
  try {
    const { currentMpin, newMpin, confirmMpin } = req.body;

    if (!currentMpin || !newMpin || !confirmMpin) {
      return error(res, "All MPIN fields are required.", 422);
    }

    if (!/^\d{4,6}$/.test(currentMpin)) {
      return error(res, "Current MPIN must be 4-6 digits.", 422);
    }

    if (!/^\d{4,6}$/.test(newMpin)) {
      return error(res, "New MPIN must be 4-6 digits.", 422);
    }

    if (!/^\d{4,6}$/.test(confirmMpin)) {
      return error(res, "Confirm MPIN must be 4-6 digits.", 422);
    }

    if (newMpin !== confirmMpin) {
      return error(res, "New MPIN and Confirm MPIN do not match.", 400);
    }

    if (currentMpin === newMpin) {
      return error(res, "New MPIN must be different from current MPIN.", 400);
    }

    const user = await User.findById(req.user._id).select("+mpin");

    if (!user) {
      return error(res, "User not found.", 404);
    }

    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (user.status === "blocked") {
      return error(res, "This account has been blocked.", 403);
    }

    if (!user.isMpinSet || !user.mpin) {
      return error(res, "MPIN is not set yet. Please create an MPIN first.", 400);
    }

    const isMatch = await bcrypt.compare(currentMpin, user.mpin);
    if (!isMatch) {
      return error(res, "Current MPIN is incorrect.", 401);
    }

    user.mpin = await bcrypt.hash(newMpin, 10);
    user.isMpinSet = true;
    await user.save();

    return success(res, "MPIN changed successfully.");
  } catch (err) {
    next(err);
  }
};

exports.mpinLogin = async (req, res, next) => {
  try {
    const { phone, countryCode, mpin } = req.body;

    if (!phone || !countryCode || !mpin) {
      return error(
        res,
        "Phone number, country code and MPIN are required.",
        422
      );
    }

    if (!/^\d{4,6}$/.test(mpin)) {
      return error(res, "MPIN must be 4-6 digits.", 422);
    }

    // Phone + countryCode both must match
    const user = await User.findOne({
      phone,
      countryCode,
    }).select("+mpin");

    if (!user) {
      return error(
        res,
        "Invalid phone number or country code.",
        401
      );
    }

    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (user.status === "blocked") {
      return error(res, "This account has been blocked.", 403);
    }

    if (!user.isPhoneVerified) {
      return error(
        res,
        "Please complete phone verification first.",
        403
      );
    }

    if (!user.isMpinSet || !user.mpin) {
      return error(
        res,
        "MPIN is not set. Please complete signup first.",
        403
      );
    }

    const isMatch = await bcrypt.compare(mpin, user.mpin);

    if (!isMatch) {
      return error(res, "Invalid MPIN.", 401);
    }

    user.lastLoginAt = new Date();

    await user.save();

    const token = generateToken(user._id);

    return success(res, "Login successful.", {
      token,
      user: {
        ...sanitizeUser(user),

        // Sync preference added in MPIN login response
        syncPreference: user.syncPreference,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBiometric = async (req, res, next) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return error(res, "Enabled must be true or false.", 422);
    }

    const user = await User.findById(req.user._id).select("+biometricToken");

    if (!user) {
      return error(res, "User not found.", 404);
    }

    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (user.status === "blocked") {
      return error(res, "This account has been blocked.", 403);
    }

    if (!user.isMpinSet) {
      return error(
        res,
        "Please create an MPIN before enabling biometric login.",
        403
      );
    }

    let rawBiometricToken = null;

    if (enabled) {
      // Naya secret generate karo aur sirf hash DB me store karo.
      rawBiometricToken = crypto.randomBytes(32).toString("hex");
      user.biometricToken = await bcrypt.hash(rawBiometricToken, 10);
      user.biometricEnabled = true;
    } else {
      // Disable karte waqt secret bhi clear kar do - purana token kaam
      // nahi karega even if device pe reh gaya ho.
      user.biometricToken = undefined;
      user.biometricEnabled = false;
    }

    await user.save();

    const token = generateToken(user._id);

    return success(
      res,
      enabled
        ? "Biometric login enabled successfully."
        : "Biometric login disabled successfully.",
      {
        token,
        user: sanitizeUser(user),
        syncPreference: user.syncPreference,
        // FIX: sirf enable karte waqt ek baar milta hai - client isko
        // securely store kare (Keychain/Keystore), response me dubara
        // kabhi nahi bheja jayega. Disable par null.
        biometricToken: rawBiometricToken,
      }
    );
  } catch (err) {
    next(err);
  }
};

exports.biometricLogin = async (req, res, next) => {
  try {
    const { phone, countryCode, biometricToken } = req.body;

    if (!phone || !countryCode || !biometricToken) {
      return error(
        res,
        "Phone number, country code and biometric token are required.",
        422
      );
    }

    const user = await User.findOne({ phone, countryCode }).select(
      "+biometricToken"
    );

    if (!user) {
      return error(res, "Invalid phone number or country code.", 401);
    }

    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    if (user.status === "blocked") {
      return error(res, "This account has been blocked.", 403);
    }

    if (!user.biometricEnabled || !user.biometricToken) {
      return error(
        res,
        "Biometric login is not enabled for this account.",
        403
      );
    }

    const isMatch = await bcrypt.compare(biometricToken, user.biometricToken);
    if (!isMatch) {
      return error(res, "Biometric verification failed. Please login with MPIN.", 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);

    return success(res, "Login successful.", {
      token,
      user: sanitizeUser(user),
      syncPreference: user.syncPreference,
    });
  } catch (err) {
    next(err);
  }
};

/* ================================================================== *
 *  PASSWORD APIs (Create / Change / Forgot)
 * ================================================================== */

/**
 * CREATE PASSWORD
 */
exports.createPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return error(res, "Password and Confirm Password are required.", 422);
    }

    if (!isStrongPassword(password)) {
      return error(
        res,
        "Password must be at least 8 characters and include 1 uppercase letter, 1 number and 1 special character.",
        422
      );
    }

    if (password !== confirmPassword) {
      return error(res, "Password and Confirm Password do not match.", 400);
    }

    const user = await User.findById(req.user._id).select("+password");

    if (user.password) {
      return error(res, "Password is already set. Use change-password instead.", 409);
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return success(res, "Password created successfully.", {
      nextStep: "home",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * CHANGE PASSWORD
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword, confirmNewPassword }
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return error(res, "All password fields are required.", 422);
    }

    if (!isStrongPassword(newPassword)) {
      return error(
        res,
        "New password must be at least 8 characters and include 1 uppercase letter, 1 number and 1 special character.",
        422
      );
    }

    if (newPassword !== confirmNewPassword) {
      return error(res, "New password and confirm password do not match.", 400);
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user.password) {
      return error(res, "No password set yet. Please create a password first.", 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return error(res, "Current password is incorrect.", 401);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return success(res, "Password changed successfully.");
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { phone, countryCode } = req.body;

    if (!phone || !countryCode) {
      return error(res, "Phone number and country code are required.", 422);
    }

    // Find user by both phone and countryCode
    const user = await User.findOne({
      phone,
      countryCode,
    });

    if (!user) {
      return error(
        res,
        "No account found with this phone number and country code.",
        404
      );
    }

    // Don't allow deleted accounts to reset password
    if (user.status === "deleted") {
      return error(res, "This account has been deleted.", 403);
    }

    const otpResponse = await issueOTP(user, "forgot_password");

    return success(res, "OTP sent to your registered phone number.", {
      phone: user.phone,
      countryCode: user.countryCode,
      otp: otpResponse?.otp || user.otp,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * RESET PASSWORD – Step 2 (after OTP verified)
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || !confirmNewPassword) {
      return error(res, "New password and Confirm Password are required.", 422);
    }

    if (!isStrongPassword(newPassword)) {
      return error(
        res,
        "Password must be at least 8 characters and include 1 uppercase letter, 1 number and 1 special character.",
        422
      );
    }

    if (newPassword !== confirmNewPassword) {
      return error(res, "Passwords do not match.", 400);
    }

    const user = await User.findById(req.user._id).select("+password");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return success(res, "Password reset successfully. You can now login.");
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
exports.getMe = async (req, res, next) => {
  try {
    return success(res, "User profile fetched.", { user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    return success(res, "Logged out successfully.");
  } catch (err) {
    next(err);
  }
};

// function sanitizeUser(user) {
//   console.log("→ sanitizeUser called");
//   console.log("→ user.profilePhoto value =", user.profilePhoto);

//   // Force default
//   const photo = user.profilePhoto || "/uploads/profiles/default-profile.png";

//   console.log("→ Final photo that will be sent =", photo);

//   return {
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     phone: user.phone,
//     countryCode: user.countryCode,
//     profilePhoto: photo,                    // ← yahan force kiya
//     isOnboarded: user.isOnboarded,
//     birthInfo: user.birthInfo,
//     cycleInfo: user.cycleInfo,
//     personalization: user.personalization,
//     createdAt: user.createdAt,
//   };
// }

function sanitizeUser(user) {
  const photo =
    user.profilePhoto ||
    "/uploads/profiles/default-profile.png";

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    countryCode: user.countryCode,
    profilePhoto: photo,

    isGuest: user.isGuest,
    isPhoneVerified: user.isPhoneVerified,
    isMpinSet: user.isMpinSet,
    biometricEnabled: user.biometricEnabled,

    isProfileComplete: user.isProfileComplete,
    isOnboarded: user.isOnboarded,

    birthInfo: user.birthInfo,
    cycleInfo: user.cycleInfo,
    personalization: user.personalization,

    createdAt: user.createdAt,
  };
}