const mongoose = require("mongoose");

// Personality description per zodiac sign — used for the "Rising Sign"
// card (and can be reused for Sun Sign / Moon Sign descriptions too)
const ZodiacSignContentSchema = new mongoose.Schema(
  {
    signName: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
      ],
    },

    icon: {
      type: String,
      default: "",
    },

    description: {
      // e.g. "You are naturally diplomatic, charming and driven by harmony and balance."
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ZodiacSignContent", ZodiacSignContentSchema);