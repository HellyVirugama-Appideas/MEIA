const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const {
  getPlans,
  getMySubscription,
  subscribe,
  cancelSubscription,
  switchPlan,
} = require("../../controllers/user/subscriptionController");

router.get("/plans", getPlans);
router.get("/my-subscription", protect, getMySubscription);
router.post("/subscribe", protect, subscribe);
router.post("/cancel", protect, cancelSubscription);
router.post("/switch-plan", protect, switchPlan);

module.exports = router;
