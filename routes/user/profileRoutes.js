const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload")("profiles"); 
const { getProfile, updateProfile, deleteProfile } = require("../../controllers/user/profileController");

router.get("/", protect, getProfile);
router.put("/", protect, upload.single("profilePhoto"), updateProfile); 
router.delete("/", protect, deleteProfile);

module.exports = router;