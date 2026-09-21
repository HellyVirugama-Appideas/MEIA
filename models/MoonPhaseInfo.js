const mongoose = require("mongoose");

// Purely descriptive/editorial content per phase now - illumination %,
// current sign, and date are calculated live via Swiss Ephemeris,
// NOT stored here anymore.
const MoonPhaseInfoSchema = new mongoose.Schema(
  {
    phaseName: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
        "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
      ],
    },
    keywords: [String], // e.g. ["Illuminate", "Dream", "Intuition"] - admin managed, replaces hardcoded map
    description: { type: String },
    guideContent: { type: String },
    // NAYA: moon calendar (day-by-day grid) aur main Moon screen ke liye
    // is phase ka icon/artwork - admin upload karta hai.
    image: { type: String },
    // NAYA: Moon Detail screen ke niche wala short poetic quote
    // (e.g. "The moon does not fight the dark; it simply shines.")
    // - description/guideContent se alag, chhota one-liner hai.
    affirmation: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MoonPhaseInfo", MoonPhaseInfoSchema);