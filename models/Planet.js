const mongoose = require("mongoose");

// Figma: "Planet detail" screen (Venus example)
const PlanetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // "Venus"
    title: { type: String, trim: true }, // "The Goddess Planet of Desire" / "The Benefic Planet of Desire"
    icon: { type: String },

    essenceTitle: String,        
    essence: String,

    // "The Essence of Venus" card
    governs: [String], // ["Love", "Beauty", "Values", "Wealth", "Artistic Expression"]
    archetype: [String], // ["The Lover", "The Artist", "The Peacemaker"]
    quote: { type: String }, // "Where Venus falls in your chart, you find..."

    // "Your Venus Influence" card
    influenceTitle: { type: String }, // "Your Venus Influence"
    influenceDescription: { type: String },
    influenceTags: [String], // ["Connection-Focused", "Aesthetic-Minded", "Observation"]

    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Planet", PlanetSchema);