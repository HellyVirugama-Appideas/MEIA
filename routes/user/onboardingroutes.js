// const express = require("express");
// const router = express.Router();

// const { protect } = require("../../middleware/auth");
// const {
//   getSlides,
//   saveLastPeriodDate,
//   savePeriodLength,
//   saveBirthInfo,
//   saveCycleInfo,
//   savePersonalization,
//   completeOnboarding,
//   getStatus,
// } = require("../../controllers/user/onboardingController");

// /* ===================== ONBOARDING SCREENS ===================== *
//  * Figma: Splash -> Onboarding 1 (Welcome) -> Select date -> Select days
//  *        -> Birth Information -> Cycle Information -> Birth Time /
//  *        No Exact Time -> Personalization Setup -> Home
//  * ================================================================= */

// // Public - shown before signup (Splash + Welcome carousel), static content
// router.get("/slides", getSlides);

// // Protected - all data-entry screens happen AFTER signup (user has a token)
// router.post("/last-period-date", protect, saveLastPeriodDate); // "Select date" screen
// router.post("/period-length", protect, savePeriodLength);      // "Select days" screen
// router.post("/birth-info", protect, saveBirthInfo);             // Birth Information / Birth Time / No Exact Time screens
// router.post("/cycle-info", protect, saveCycleInfo);             // Cycle Information screen (averages)
// router.post("/personalization", protect, savePersonalization);  // Personalization Setup screen
// router.post("/complete", protect, completeOnboarding);           // finish -> go to Home
// router.get("/status", protect, getStatus);                       // resume onboarding / check progress

// module.exports = router;


const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const {
  getSlides,
  startOnboarding,
  saveLastPeriodDate,
  savePeriodLength,
  saveBirthInfo,
  saveCycleInfo,
  savePersonalization,
  completeOnboarding,
  getStatus,
  saveSyncPreference,
} = require("../../controllers/user/onboardingController");

/* ===================== ONBOARDING SCREENS (FIRST) ===================== *
 * Figma: Splash -> Onboarding 1 (Welcome) -> Select date -> Select days
 *        -> Birth Information -> Cycle Information -> Birth Time /
 *        No Exact Time -> Personalization Setup -> SIGNUP -> Home
 *
 * NEW ORDER: onboarding data-entry now happens BEFORE signup, as a guest.
 * 1) POST /start          -> creates guest user, returns a guest token
 * 2) All data screens      -> saved against that guest token (Bearer)
 * 3) POST /complete        -> marks onboarding done, tells frontend to
 *                             go to Signup next
 * 4) POST /api/auth/signup (guest token) -> attaches phone number,
 *    verify-otp -> set-mpin -> guest becomes a real account (isGuest=false)
 * ========================================================================= */

// Public - shown before signup (Splash + Welcome carousel), static content
router.get("/slides", getSlides);

// Public - kicks off onboarding, issues the guest token used below
router.post("/start", startOnboarding);

router.post("/sync-preference", protect, saveSyncPreference);   // ← new – right after start

// Protected with the GUEST token (not a full account yet) - all
// data-entry screens happen BEFORE signup now
router.post("/last-period-date", protect, saveLastPeriodDate); // "Select date" screen
router.post("/period-length", protect, savePeriodLength);      // "Select days" screen
router.post("/birth-info", protect, saveBirthInfo);             // Birth Information / Birth Time / No Exact Time screens
router.post("/cycle-info", protect, saveCycleInfo);             // Cycle Information screen (averages)
router.post("/personalization", protect, savePersonalization);  // Personalization Setup screen
router.post("/complete", protect, completeOnboarding);           // finish onboarding -> go to Signup next
router.get("/status", protect, getStatus);                       // resume onboarding / check progress

module.exports = router;