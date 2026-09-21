const mongoose = require("mongoose");

// Figma: "The Draw" screen - tarot deck managed by admin
const TarotCardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "The High Priestess"
    arcana: { type: String, enum: ["major", "minor"], default: "major" },
    image: { type: String },
    keywords: [{ type: String }], // "intuition, mystery, subconscious"
    description: { type: String, required: true }, // shown on draw detail
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TarotCard", TarotCardSchema);