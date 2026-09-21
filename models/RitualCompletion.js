const mongoose = require("mongoose");

// Tracks a user's daily ritual progress (per-step + overall)
const RitualCompletionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true }, // date-only
    completedSteps: [{ type: mongoose.Schema.Types.ObjectId, ref: "RitualStep" }],
    isFullyCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RitualCompletionSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("RitualCompletion", RitualCompletionSchema);