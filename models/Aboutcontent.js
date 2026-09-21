const mongoose = require("mongoose");

/* ============================================================
   About Content - singleton document (only one active record
   expected, similar to how Terms & Conditions works). Admin can
   update hero image, title, main description, a set of info
   cards (icon + description), and the bottom CTA section
   (matches the "Book A Reading" block in the Figma "About" screen).
============================================================ */

const AboutContentSchema = new mongoose.Schema(
  {
    heroImage: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // The 3 dark info cards with icon + short text
    infoCards: [
      {
        icon: String,
        title: String,
        description: String,
      },
    ],

    // Bottom CTA block ("Seek A Clarification" / "Book A Reading")
    ctaSection: {
      title: String,
      description: String,
      buttonText: {
        type: String,
        default: "Book A Reading",
      },
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

module.exports = mongoose.model("AboutContent", AboutContentSchema);