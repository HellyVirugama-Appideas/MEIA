const mongoose = require("mongoose");

const PeriodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    flow: { type: String, enum: ["Heavy", "Spot", "Light"] },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PeriodLog", PeriodLogSchema);