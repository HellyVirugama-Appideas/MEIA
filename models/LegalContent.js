const mongoose = require("mongoose");

const LegalContentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      enum: ["terms", "privacy_policy"],
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // HTML/markdown body text
    version: { type: String, default: "1.0" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LegalContent", LegalContentSchema);