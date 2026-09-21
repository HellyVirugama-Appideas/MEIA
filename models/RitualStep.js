const mongoose = require("mongoose");

// Figma: "Moonlight Ritual" screen - admin-managed template of steps
const RitualStepSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "gratitude_prompt",
        "reflection_prompt",
        "tomorrows_intention",
        "guided_breathing",
        "evening_journaling",
        "gentle_playlist",
      ],
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String }, // e.g. prompt question text
    icon: { type: String },
    image: { type: String },
    // only used when type = "guided_breathing"
    breathing: {
      inhaleSeconds: { type: Number, default: 4 },
      holdSeconds: { type: Number, default: 7 },
      exhaleSeconds: { type: Number, default: 8 },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RitualStep", RitualStepSchema);