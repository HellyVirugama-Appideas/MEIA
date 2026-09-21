const mongoose = require("mongoose");

const PhysicalSymptomOptionSchema = new mongoose.Schema(
  {
    name: {
      // e.g. "Headache", "Bloating", "Cramps", "Fatigue"
      type: String,
      required: true,
    },

    icon: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PhysicalSymptomOption", PhysicalSymptomOptionSchema);