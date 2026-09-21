const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload")("journal"); // reuses the multer factory
const {
  listJournalEntries,
  createJournalEntry,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalOptions,
} = require("../../controllers/user/journalController");

router.get("/", protect, listJournalEntries);

router.get("/options",protect, getJournalOptions)

router.post("/", protect, upload.single("image"), createJournalEntry);
router.get("/:id", protect, getJournalEntry);
router.put("/:id", protect, upload.single("image"), updateJournalEntry);
router.delete("/:id", protect, deleteJournalEntry);


module.exports = router;