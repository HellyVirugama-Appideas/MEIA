const mongoose = require("mongoose");

// Figma: "Select..." screens where user picks goals/interests/experience level
const OnboardingOptionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["goal", "interest", "experience_level", "reminder_time"],
      // "goal" -> e.g. "Reduce Stress", "Better Sleep" (Select screen 1)
      // "interest" -> e.g. "Meditation", "Breathing", "Sleep Stories" (Select screen 2)
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String, // icon URL/name shown next to option
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnboardingOption", OnboardingOptionSchema);
