const moment = require("moment-timezone");
const UserActivity = require("../models/UserActivity");

const ACTIVITY_TZ = "Asia/Kolkata";   // UAE ke liye "Asia/Dubai", sirf yahin badalna hai

const dayKey = (date = new Date()) => moment(date).tz(ACTIVITY_TZ).format("YYYY-MM-DD");

// memory cache: same user ke liye din me sirf ek baar DB write ho
const seen = new Map();   // userId -> dayKey

const trackActivity = (userId) => {
  const key = dayKey();
  const id = String(userId);
  if (seen.get(id) === key) return;

  if (seen.size > 20000) seen.clear();
  seen.set(id, key);

  UserActivity.updateOne(
    { user: userId, date: key },
    { $set: { lastSeenAt: new Date() } },
    { upsert: true }
  ).catch((err) => {
    seen.delete(id);
    if (err.code !== 11000) console.error("trackActivity error:", err.message);
  });
};

module.exports = { trackActivity, dayKey, ACTIVITY_TZ };