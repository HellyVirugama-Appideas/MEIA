// models/TarotSettings.js
const mongoose = require("mongoose");

const tarotSettingsSchema = new mongoose.Schema({
  cardsPerDraw: {
    type: Number,
    default: 2,
    min: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model("TarotSettings", tarotSettingsSchema);