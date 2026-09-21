const mongoose = require("mongoose");

// Figma: "Unlock Your Complete Cosmic Journey" (Why Go Pro? comparison) +
// "Switch Your Plan" screen (Monthly/Yearly plan cards)
const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "Monthly Plan", "Yearly Plan"
    billingCycle: { type: String, enum: ["weekly", "monthly", "yearly"], required: true },
    price: { type: Number, required: true }, // in smallest currency unit's display form, e.g. 9.99
    currency: { type: String, default: "usd", lowercase: true },
    // Both of these are now set automatically by the backend when the
    // admin saves a plan - never entered manually. stripeProductId lets
    // us reuse the same Stripe Product when creating a new Price after
    // an edit (Stripe Prices are immutable, so edits create a new one).
    stripeProductId: { type: String },
    stripePriceId: { type: String },
    features: [{ type: String }], // rows shown in the Free vs Pro comparison table
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);