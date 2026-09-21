const mongoose = require("mongoose");

const ElementalStateContentSchema = new mongoose.Schema(
  {
    element: {
      type: String,
      required: true,
      unique: true,
      enum: ["Earth", "Water", "Fire", "Air"],
    },

    title: {
      // e.g. "Grounded Earth"
      type: String,
      required: true,
    },

    description: {
      // shown in "Elemental State" card on Insight Summary screen
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ElementalStateContent", ElementalStateContentSchema); 