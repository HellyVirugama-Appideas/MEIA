const express = require("express");
const router = express.Router();

const { getFaqs, searchFaqs } = require("../../controllers/user/faqController");

router.get("/", getFaqs);
router.get("/search", searchFaqs);

module.exports = router;