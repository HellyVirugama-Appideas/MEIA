const mongoose = require("mongoose");

const WeeklyReadingSchema = new mongoose.Schema(
  {
    weekStartDate: {
      type: Date,
      required: true,
    },

    weekEndDate: {
      type: Date,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    summary: String,

    content: {
      type: String,
      required: true,
    },

    heroImage: String,

    focusArea: String,

    affirmation: String,

    // same as DailyReading
    readTimeMinutes: {
      type: Number,
      default: 3,
    },

    cycleAstralSynergy: String,

    moonPhaseGuidance: [
      {
        title: String,
        description: String,
      },
    ],

    eveningReflectionPrompt: String,
    creativeRitual: {
      title: String,
      description: String,
      buttonText: {
        type: String,
        default: "Continue Ritual"
      }
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WeeklyReading", WeeklyReadingSchema);