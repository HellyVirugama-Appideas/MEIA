const mongoose = require("mongoose");

// Figma: "Journal History" + "Edit Journal" screens (also used for Moonlight Reflection)
const JournalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true }, // "Moon in Pisces: Emotional Echoes"
    content: { type: String, required: true },
    moodTag: { type: String, trim: true }, // "Manifestation Renewal", "Navigating the Void"
    celestialContext: { type: String }, // e.g. "Moon in Pisces"
    // NAYA: Journal History card ke niche wale multiple pill badges
    // (jaise "Manifestation", "Growth") - "Sync with mood" multi-select
    // se aate hain, single moodTag se alag hai.
    tags: [{ type: String, trim: true }],
    // NAYA: "Moonlight Ritual" screen ke Gratitude/Reflection/Journaling
    // cards is hi Journal screen pe redirect karte hain - agar wahan se
    // aaya ho to yahan link store hota hai, aur save hote hi corresponding
    // ritual step automatically "complete" mark ho jaata hai.
    ritualStep: { type: mongoose.Schema.Types.ObjectId, ref: "RitualStep" },
    image: { type: String },
    entryDate: { type: Date, default: Date.now }, // "Celestial Date" shown on edit screen

    bookmarkedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Journal", JournalSchema);