const mongoose = require("mongoose");

const CyclePhaseContentSchema = new mongoose.Schema(
  {
    phaseKey: {
      type: String,
      required: true,
      unique: true,
      enum: ["menstrual", "follicular", "ovulation", "luteal"],
    },

    title: {
      // e.g. "Bloom Phase", "Follicular Phase"
      type: String,
      required: true,
    },

    description: {
      // e.g. "Your energy is rising, a beautiful blend of intuition..."
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    tips: [String],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CyclePhaseContent", CyclePhaseContentSchema);