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
  updatePeriod,
  deletePeriod,
} = require("../../controllers/user/rhythmController");

router.get("/", protect, getRhythmDashboard);
router.get("/calendar", protect, getCalendar);
router.post("/period", protect, logPeriod);
router.get("/period/history", protect, getPeriodHistory);

// router.put("/period/:id", protect, updatePeriod);      
router.patch("/period/:id", protect, updatePeriod);   
router.delete("/period/:id", protect, deletePeriod);

router.get("/symptoms/today", protect, getTodaySymptoms); 
router.post("/symptoms", protect, logSymptoms);
router.get("/symptoms/history", protect, getSymptomHistory);
router.get("/symptoms/options", protect, getSymptomOptions);
router.get("/insights", protect, getInsights);

module.exports = router;
