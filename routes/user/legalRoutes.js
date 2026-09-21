const express = require("express");
const router = express.Router();

const { getTerms, getPrivacyPolicy } = require("../../controllers/user/legalController");

router.get("/terms", getTerms);
router.get("/privacy-policy", getPrivacyPolicy);

module.exports = router;