const mongoose = require("mongoose");

// Logs which card each user drew, so "today's card" stays the same on repeat visits
const TarotDrawSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    card: [                                           // ← plural "cards"
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TarotCard",
        required: true,
      },
    ],
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

TarotDrawSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("TarotDraw", TarotDrawSchema);