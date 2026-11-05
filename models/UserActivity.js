const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },   // "YYYY-MM-DD" (timezone ke hisaab se)
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ek user ka ek din me ek hi record
UserActivitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("UserActivity", UserActivitySchema);