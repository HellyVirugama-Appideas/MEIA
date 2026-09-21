const mongoose = require("mongoose");

// Figma: "Cosmic Inhale" screen - breathing exercise types (admin managed)
const BreathingSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // "Cosmic Inhale"
    subtitle: { type: String }, // "Take a mindful moment..."
    icon: { type: String },
    inhaleSeconds: { type: Number, default: 4 },
    holdSeconds: { type: Number, default: 7 },
    exhaleSeconds: { type: Number, default: 8 },
    totalCycles: { type: Number, default: 3 }, // "Cycle 1 of 3"
    audioType: { type: String, default: "Guided + Chimes" }, // "Audio" row on detail screen
    // "Cycle Focus" row on the Cosmic Inhale detail screen — lets admin tag a
    // session as recommended for a specific cycle phase ("luteal" -> shown as
    // "Bloom"). Leave blank/"all" to show for every phase.
    cyclePhaseKey: {
      type: String,
      enum: ["all", "menstrual", "follicular", "ovulation", "luteal"],
      default: "all",
    },
    benefits: [
      {
        icon: { type: String },
        label: { type: String }, // "Reduce Stress", "Improve Focus", "Emotional Balance"
        description: { type: String }, // small subtext under the label
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BreathingSession", BreathingSessionSchema);