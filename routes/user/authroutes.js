// const express = require("express");
// const rateLimit = require("express-rate-limit");
// const router = express.Router();

// const { protect } = require("../../middleware/auth");
// const {
//   signup,
//   resendOtp,
//   verifyOtp,
//   setMpin,
//   signin,
//   forgotMpin,
//   getMe,
//   logout,
// } = require("../../controllers/user/authController");

// // Basic rate limiting on OTP endpoints to prevent SMS abuse / cost blowup
// const otpLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,
//   message: {
//     success: false,
//     message: "Too many OTP requests. Please try again after some time.",
//   },
// });

// /* ===================== SIGN UP FLOW ===================== *
//  * Figma: Sign up (phone only) -> OTP Verification -> New Mpin
//  *        -> Confirm Mpin -> account created -> Onboarding screens next
//  * =========================================================== */
// router.post("/signup", signup);                 // step 1: enter phone number
// router.post("/resend-otp", otpLimiter, resendOtp); // resend link on OTP screen
// router.post("/verify-otp", verifyOtp);           // step 2: verify OTP
// router.post("/set-mpin", protect, setMpin);      // step 3: enter new MPIN

// /* ===================== SIGN IN FLOW ===================== *
//  * Figma: Sign in (phone + mpin) -> Forgot Mpin -> OTP -> New Mpin -> Confirm Mpin
//  * =========================================================== */
// router.post("/signin", signin);                     // phone + mpin direct login
// router.post("/forgot-mpin", otpLimiter, forgotMpin); // sends OTP to reset mpin
// // NOTE: after verify-otp (purpose=forgot_mpin), reuse /set-mpin -> /confirm-mpin above

// /* ===================== SESSION ===================== */
// router.get("/me", protect, getMe);
// router.post("/logout", protect, logout);

// module.exports = router;


const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const {
  signup,
  resendOtp,
  verifyOtp,
  setMpin,
  signin,
  forgotMpin,
  getMe,
  logout,
  createPassword,
  changePassword,
  forgotPassword,
  resetPassword,
  mpinLogin,
  resetMpin,
  updateBiometric,
  checkMpinStatus,
  biometricLogin,
  changeMpin,
} = require("../../controllers/user/authController");

// Basic rate limiting on OTP endpoints to prevent SMS abuse / cost blowup
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after some time.",
  },
});

/* ===================== SIGN UP FLOW (NOW RUNS AFTER ONBOARDING) ===== *
 * Figma: Onboarding screens (guest, POST /api/onboarding/start first)
 *        -> Sign up (phone only) -> OTP Verification -> New Mpin
 *        -> Confirm Mpin -> account finalized (isGuest=false) -> Home
 *
 * NOTE: "/signup" is protected with the GUEST token issued by
 * POST /api/onboarding/start, so it attaches phone to the same user
 * that already has all the onboarding data, instead of creating a
 * brand-new empty user.
 * ====================================================================== */
router.post("/signup", protect, signup);         // step 1: attach phone to the onboarded guest account
router.post("/resend-otp", otpLimiter, resendOtp); // resend link on OTP screen
router.post("/verify-otp", verifyOtp);           // step 2: verify OTP


/* ===================== MPIN ==============================  */

router.post("/check-mpin", checkMpinStatus);

router.post("/set-mpin", protect, setMpin);      
// MPIN login
router.post("/mpin-login", mpinLogin);

// Forgot MPIN
router.post("/forgot-mpin", otpLimiter, forgotMpin);

// Reset MPIN after OTP verification
router.post("/reset-mpin", protect, resetMpin);

router.post("/change-mpin", protect, changeMpin);

router.post("/biometric-login", biometricLogin);

router.put("/biometric", protect, updateBiometric);

/* ===================== SIGN IN FLOW ===================== *
 * Figma: Sign in (phone + mpin) -> Forgot Mpin -> OTP -> New Mpin -> Confirm Mpin
 * =========================================================== */
router.post("/signin", signin);                     // phone + mpin direct login
router.post("/forgot-mpin", otpLimiter, forgotMpin); // sends OTP to reset mpin
// NOTE: after verify-otp (purpose=forgot_mpin), reuse /set-mpin -> /confirm-mpin above

/*  ====================== PASSWORD APIS ========================     */
router.post("/create-password", protect, createPassword);       
router.post("/change-password", protect, changePassword);       
router.post("/forgot-password", otpLimiter, forgotPassword);    
router.post("/reset-password", protect, resetPassword);

/* ===================== SESSION ===================== */
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;