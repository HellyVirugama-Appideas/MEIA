const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const { getTodayReading, getWeeklyReading } = require("../../controllers/user/dailyReadingController");

router.get("/today", protect, getTodayReading);
router.get("/weekly", protect, getWeeklyReading);

module.exports = router;