const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const { getHome } = require("../../controllers/user/homeController");

router.get("/", protect, getHome);

module.exports = router;