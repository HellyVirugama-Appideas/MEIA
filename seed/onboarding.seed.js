// Run: node seed/onboarding.seed.js
// Populates sample data for the onboarding slides + "Select" screens
// so the onboarding APIs return real content out of the box.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const OnboardingSlide = require("../models/OnboardingSlide");
const OnboardingOption = require("../models/OnboardingOption");

const slides = [
  {
    title: "Welcome to MEIA",
    description: "Your quiet space for calm, focus and better sleep.",
    image: "https://cdn.meia.app/onboarding/slide-1.png",
    order: 1,
  },
  {
    title: "Guided Meditations",
    description: "Short, guided sessions designed to fit your day.",
    image: "https://cdn.meia.app/onboarding/slide-2.png",
    order: 2,
  },
  {
    title: "Sleep Better Tonight",
    description: "Wind down with calming sounds and sleep stories.",
    image: "https://cdn.meia.app/onboarding/slide-3.png",
    order: 3,
  },
  {
    title: "Track Your Journey",
    description: "Build a daily habit and watch your progress grow.",
    image: "https://cdn.meia.app/onboarding/slide-4.png",
    order: 4,
  },
];

const options = [
  // Select screen 1 - goals
  { category: "goal", label: "Reduce Stress & Anxiety", order: 1 },
  { category: "goal", label: "Improve Sleep", order: 2 },
  { category: "goal", label: "Increase Focus", order: 3 },
  { category: "goal", label: "Build a Daily Habit", order: 4 },
  { category: "goal", label: "Personal Growth", order: 5 },

  // Select screen 2 - interests
  { category: "interest", label: "Guided Meditation", order: 1 },
  { category: "interest", label: "Breathing Exercises", order: 2 },
  { category: "interest", label: "Sleep Stories", order: 3 },
  { category: "interest", label: "Calming Music", order: 4 },
  { category: "interest", label: "Mindful Journaling", order: 5 },

  // Experience level
  { category: "experience_level", label: "Beginner", order: 1 },
  { category: "experience_level", label: "Intermediate", order: 2 },
  { category: "experience_level", label: "Advanced", order: 3 },

  // Reminder time
  { category: "reminder_time", label: "Morning", order: 1 },
  { category: "reminder_time", label: "Afternoon", order: 2 },
  { category: "reminder_time", label: "Evening", order: 3 },
  { category: "reminder_time", label: "Night", order: 4 },
];

const run = async () => {
  await connectDB();

  await OnboardingSlide.deleteMany({});
  await OnboardingOption.deleteMany({});

  await OnboardingSlide.insertMany(slides);
  await OnboardingOption.insertMany(options);

  console.log("Onboarding slides & options seeded successfully.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
