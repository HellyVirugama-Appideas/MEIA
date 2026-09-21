const mongoose = require("mongoose");

const UserSubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    status: {
      type: String,
      enum: ["active", "past_due", "cancelled", "incomplete", "none"],
      default: "none",
    },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSubscription", UserSubscriptionSchema);
