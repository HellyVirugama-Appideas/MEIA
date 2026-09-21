const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { getAbout } = require("../../controllers/user/AboutContent");

router.get("/", protect, getAbout);

module.exports = router;