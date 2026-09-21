const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const {
  listSessions,
  getSessionDetail,
  completeSession,
  setReminderTime,
} = require("../../controllers/user/breathingController");

router.get("/sessions", protect, listSessions);
// Cosmic Inhale detail screen (circle, cycle count, moon phase, cycle focus, benefits)
router.get("/sessions/:id", protect, getSessionDetail);
router.post("/sessions/:id/complete", protect, completeSession);
router.put("/reminder-time", protect, setReminderTime);

module.exports = router;