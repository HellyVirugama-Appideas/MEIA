const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../../controllers/user/subscriptionController");

// IMPORTANT: express.raw() is required here because Stripe needs the raw,
// unparsed request body to verify the webhook signature. This route MUST
// be mounted in app.js BEFORE app.use(express.json()), otherwise the body
// will already be parsed into an object and signature verification fails.
router.post("/", express.raw({ type: "application/json" }), handleWebhook);

module.exports = router;
