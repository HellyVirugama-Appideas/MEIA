const mongoose = require("mongoose");

// "Your Cosmic Personality" screen content, driven by the user's SUN
// SIGN - same for every user who shares that Sun Sign (not user-unique).
// FIX: Figma design shows Strengths / Growth Areas / Cosmic Gift cards,
// not generic title+description "traits" - restructured to match.
const BirthChartPersonalityContentSchema = new mongoose.Schema(
  {
    sunSign: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
      ],
    },

    // "Your Cosmic Personality" paragraph (dark navy card)
    personalitySummary: {
      type: String,
      required: true,
    },

    // "STRENGTHS" card - short word/phrase list
    strengths: [{ type: String }],

    // "GROWTH AREAS" card - short word/phrase list
    growthAreas: [{ type: String }],

    // "COSMIC GIFT" card - short paragraph
    cosmicGift: { type: String },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "BirthChartPersonalityContent",
  BirthChartPersonalityContentSchema
);