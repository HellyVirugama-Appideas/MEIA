const express = require("express");
const router = express.Router();
const {
    toggleSaveReading,
    toggleSaveJournal,
    listSavedItems,
    checkReadingSaved,
    toggleSaveWeekly,
} = require("../../controllers/user/bookmarkController");
const { protect } = require("../../middleware/auth");


// List with search + filter
router.get("/", protect, listSavedItems);

// Save / Unsave Daily Reading
router.post("/reading/:id", protect, toggleSaveReading);

router.post("/weekly/:id", protect, toggleSaveWeekly);

// Check status (optional)
router.get("/reading/:id/status", protect, checkReadingSaved);

// Save / Unsave Journal
router.post("/journal/:id", protect, toggleSaveJournal);

module.exports = router;