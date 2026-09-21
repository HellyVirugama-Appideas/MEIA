const mongoose = require("mongoose");

// "Moonlight-gratitude" / "Edit Journal" screens ka "Category" dropdown -
// admin freely add/edit/delete kar sakta hai (fixed list nahi, jaisa
// Zodiac Signs hai - yahan admin jitni chahe utni categories bana sakta
// hai: "Mercury in Retrograde", "Moon Phases", "Daily Reading", etc.)
const JournalCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// FIX: guard against OverwriteModelError - agar iss file ko kabhi
// case-insensitive path (Windows) se do baar require kiya jaye
// (jaise "JournalCategory" aur "Journalcategory"), Node dono ko alag
// module treat karke model dobara register karne ki koshish karta hai.
// Ye guard usse crash hone se bachata hai.
module.exports =
  mongoose.models.JournalCategory ||
  mongoose.model("JournalCategory", JournalCategorySchema);