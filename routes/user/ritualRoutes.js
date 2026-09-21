const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const {
  getTodayRitual,
  completeStep,
  completeRitual,
} = require("../../controllers/user/ritualController");

router.get("/today", protect, getTodayRitual);
router.post("/steps/:stepId/complete", protect, completeStep);
router.post("/complete", protect, completeRitual);

module.exports = router;