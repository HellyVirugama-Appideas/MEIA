const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const {
  getRhythmDashboard,
  getCalendar,
  logPeriod,
  getPeriodHistory,
  logSymptoms,
  getSymptomHistory,
  getSymptomOptions,
  getInsights,
  getTodaySymptoms,
} = require("../../controllers/user/rhythmController");

router.get("/", protect, getRhythmDashboard);
router.get("/calendar", protect, getCalendar);
router.post("/period", protect, logPeriod);
router.get("/period/history", protect, getPeriodHistory);
router.get("/symptoms/today", protect, getTodaySymptoms); 
router.post("/symptoms", protect, logSymptoms);
router.get("/symptoms/history", protect, getSymptomHistory);
router.get("/symptoms/options", protect, getSymptomOptions);
router.get("/insights", protect, getInsights);

module.exports = router;
