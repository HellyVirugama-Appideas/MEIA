const mongoose = require("mongoose");

// "Upcoming Phases" list on Moon detail screen (Full Moon, New Moon, Last Quarter...)
const UpcomingMoonEventSchema = new mongoose.Schema(
  {
    phaseName: { type: String, required: true, trim: true }, // "Full Moon"
    subtitle: { type: String, trim: true }, // "(Strawberry Moon)"
    date: { type: Date, required: true },
    time: { type: String }, // "9:12 PM"
  },
  { timestamps: true }
);

module.exports = mongoose.model("UpcomingMoonEvent", UpcomingMoonEventSchema);