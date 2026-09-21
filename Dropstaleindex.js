// // One-time script to remove the old/stale "zodiacSign_1_date_1" unique index
// // Run this once with: node dropStaleIndex.js
// // Make sure your MONGODB_URI / connection string below matches your .env

// const mongoose = require("mongoose");

// // 🔧 Replace this with your actual connection string (same one your app uses)
// const MONGO_URI = process.env.MONGO_URI || "your-mongodb-connection-string-here";

// async function run() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("Connected to MongoDB");

//     const collection = mongoose.connection.collection("dailyreadings");

//     const indexes = await collection.indexes();
//     console.log("Current indexes:", indexes);

//     const staleIndex = indexes.find(
//       (idx) => idx.name === "zodiacSign_1_date_1"
//     );

//     if (staleIndex) {
//       await collection.dropIndex("zodiacSign_1_date_1");
//       console.log("✅ Dropped stale index: zodiacSign_1_date_1");
//     } else {
//       console.log("ℹ️ Index zodiacSign_1_date_1 not found (already removed?)");
//     }

//     const updatedIndexes = await collection.indexes();
//     console.log("Indexes after cleanup:", updatedIndexes);

//     process.exit(0);
//   } catch (err) {
//     console.error("Error dropping index:", err);
//     process.exit(1);
//   }
// }

// run();

const mongoose = require("mongoose");
require("dotenv").config(); // agar .env use kar rahe ho

// Apna MongoDB connection string yahan daalo
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

async function dropBadIndex() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const PeriodLog = require("./models/PeriodLog"); // path check kar lo

    // Index drop karo
    await PeriodLog.collection.dropIndex("user_1_date_1");
    console.log("✅ Index 'user_1_date_1' successfully dropped!");

  } catch (err) {
    if (err.code === 27 || err.message.includes("index not found")) {
      console.log("✅ Index already does not exist. Nothing to drop.");
    } else {
      console.error("❌ Error:", err.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0);
  }
}

dropBadIndex();