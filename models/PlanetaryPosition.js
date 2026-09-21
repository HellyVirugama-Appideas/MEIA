const mongoose = require("mongoose");

// Admin-entered current positions shown on Celestial screen
// (real ephemeris calculation is out of scope - see note above)
const PlanetaryPositionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    planet: { type: String, required: true, trim: true },
    sign: { type: String, required: true, trim: true }, // "Libra"
    degree: { type: String }, // "14°"
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlanetaryPosition", PlanetaryPositionSchema);