const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const { registerDevice } = require("../../controllers/user/deviceController");

router.post("/register", protect, registerDevice);

module.exports = router;
