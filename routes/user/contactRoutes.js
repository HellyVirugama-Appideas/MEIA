const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload")("contact"); // reusable multer, "contact" folder

const {
  getCategories,
  submitMessage,
  getMyMessages,
  getMessageById,
} = require("../../controllers/user/contactController");

/* ===================== CONTACT US SCREENS ===================== *
 * Figma: Contact Us (form) -> Attach Image -> Submitted (success)
 * =================================================================== */
router.get("/categories", getCategories);
router.post("/", protect, upload.single("image"), submitMessage);
router.get("/my-requests", protect, getMyMessages);
router.get("/:id", protect, getMessageById);

module.exports = router;