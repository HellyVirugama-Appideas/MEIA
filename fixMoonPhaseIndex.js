// Run: node seed/fixMoonPhaseIndex.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const run = async () => {
  await connectDB();

  const db = mongoose.connection.db;
  const collectionName = "moonphaseinfos";

  const collections = await db.listCollections({ name: collectionName }).toArray();

  if (collections.length === 0) {
    console.log(`Collection "${collectionName}" doesn't exist yet - nothing to fix.`);
  } else {
    await db.collection(collectionName).drop();
    console.log(`Dropped "${collectionName}" collection successfully.`);
    console.log(
      "It will be recreated automatically (with the correct schema) the next time you open /admin/content/moon-phases."
    );
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to fix collection:", err.message);
  process.exit(1);
});