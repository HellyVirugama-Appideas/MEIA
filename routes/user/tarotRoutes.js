const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const { getTodayCard, shuffleAndDraw, getAllCards, selectCard } = require("../../controllers/user/tarotController");


router.get("/cards", protect, getAllCards);
router.post("/select", protect, selectCard);
// router.get("/today", protect, getTodayCard);
// router.post("/shuffle", protect, shuffleAndDraw);

module.exports = router;