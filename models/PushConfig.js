const mongoose = require("mongoose");

// Admin > Notification Management > Push Notification Setup
// Stores provider config (FCM server key etc). Actual push-sending SDK
// call is a stub in the controller - plug in firebase-admin or
// OneSignal SDK where marked, once the client provides credentials.
const PushConfigSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ["fcm", "onesignal"], default: "fcm" },
    fcmServerKey: { type: String },
    fcmProjectId: { type: String },
    oneSignalAppId: { type: String },
    oneSignalApiKey: { type: String },
    isEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PushConfig", PushConfigSchema);
