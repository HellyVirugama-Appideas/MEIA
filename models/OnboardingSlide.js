const mongoose = require("mongoose");

// Figma: "Splash", "Onboarding" carousel screens (image + title + description)
const OnboardingSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // image URL / CDN path shown on the slide
    },
    order: {
      type: Number,
      required: true,
      default: 0, // controls slide sequence (1,2,3...)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnboardingSlide", OnboardingSlideSchema);
