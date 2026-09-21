const mongoose = require("mongoose");

const savedItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // "reading" | "journal" | "insight"
    // daily + weekly DONO type = "reading" use karenge
    type: {
      type: String,
      enum: ["reading", "journal", "insight"],
      required: true,
    },

    dailyReading: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyReading",
    },

    weeklyReading: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyReading",
    },

    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Unique indexes
savedItemSchema.index(
  { user: 1, dailyReading: 1 },
  { unique: true, partialFilterExpression: { dailyReading: { $exists: true, $ne: null } } }
);

savedItemSchema.index(
  { user: 1, weeklyReading: 1 },
  { unique: true, partialFilterExpression: { weeklyReading: { $exists: true, $ne: null } } }
);

savedItemSchema.index(
  { user: 1, journal: 1 },
  { unique: true, partialFilterExpression: { journal: { $exists: true, $ne: null } } }
);

module.exports = mongoose.model("SavedItem", savedItemSchema);