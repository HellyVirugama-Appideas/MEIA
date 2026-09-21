const mongoose = require("mongoose");

const SymptomLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    mood: {
      type: String,
      enum: ["Happy", "Fun", "Sad", "Shocked", "Angry", "Frustrated"],
    },
    sleepHours: { type: Number },
    physicalSymptoms: [
      {
        type: String,
        enum: [
          "Cramps",
          "Headache",
          "Bloating",
          "Breast Tenderness",
          "Back Pain",
          "Fatigue",
          "Acne",
          "Nausea",
          "Mood Swings",
          "Food Cravings",
        ],
      },
    ],
    // "Edit Today's Symptoms" screen shows Energy as a 0-100% slider,
    // not a Low/Medium/High picker - was previously a mismatched String enum.
    energy: { type: Number, min: 0, max: 100 },
    feelingNote: { type: String, trim: true },
  },
  { timestamps: true }
);

SymptomLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("SymptomLog", SymptomLogSchema);