const mongoose = require("mongoose");

// "Powered By" footer on the Celestial screen — e.g. Swiss Ephemeris,
// Sidereal Astrology, Lahiri Ayanamsa. Admin-managed, ordered list.
const PoweredByContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // "Swiss Ephemeris"
    description: { type: String, required: true }, // "High precision astronomical data"
    icon: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PoweredByContent", PoweredByContentSchema);