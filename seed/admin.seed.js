// Run: node seed/admin.seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../models/admin");

const run = async () => {
  await connectDB();

  const email = "admin@meia.app";
  const plainPassword = "Admin@123";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    return process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await Admin.create({
    name: "Super Admin",
    email,
    password: hashedPassword,
  });

  console.log("Admin created successfully.");
  console.log("Email:", email);
  console.log("Password:", plainPassword, "(change this after first login)");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
