const Notification = require("../../models/Notification");
const User = require("../../models/User");
const PushConfig = require("../../models/PushConfig");

/* ------------------------------------------------------------------ */
/*  LIST NOTIFICATIONS -> GET /admin/notifications                     */
/* ------------------------------------------------------------------ */
exports.listNotifications = async (req, res) => {
  const notifications = await Notification.find()
    .populate("user", "name phone")
    .sort({ createdAt: -1 })
    .limit(100);

  res.render("notifications", {
    title: "Notifications",
    notifications,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

/* ------------------------------------------------------------------ */
/*  COMPOSE FORM -> GET /admin/notifications/new                       */
/* ------------------------------------------------------------------ */
exports.composeForm = async (req, res) => {
  const users = await User.find({ status: "active" }).select("name phone").limit(500);

  res.render("notification_compose", {
    title: "Send Notification",
    users,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

/* ------------------------------------------------------------------ */
/*  SEND NOTIFICATION -> POST /admin/notifications/send                 */
/*  target = "all" (broadcast) OR a specific userId                     */
/* ------------------------------------------------------------------ */
exports.sendNotification = async (req, res) => {
  try {
    const { target, title, message, type } = req.body;

    if (target === "all") {
      const users = await User.find({ status: "active" }).select("_id");
      const docs = users.map((u) => ({ user: u._id, title, message, type: type || "system" }));
      if (docs.length) await Notification.insertMany(docs);
    } else {
      await Notification.create({ user: target, title, message, type: type || "system" });
    }

    // Real push send via FCM/OneSignal happens here once credentials are
    // configured on the Push Notification Setup page - see pushConfig below.
    // Example (once firebase-admin is installed and configured):
    //   const config = await PushConfig.findOne();
    //   if (config?.isEnabled) { admin.messaging().send({...}) }

    req.flash("success", "Notification sent successfully!");
    res.redirect("/admin/notifications");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to send notification.");
    res.redirect("/admin/notifications/new");
  }
};

/* ------------------------------------------------------------------ */
/*  PUSH SETUP FORM -> GET /admin/notifications/push-setup             */
/* ------------------------------------------------------------------ */
exports.getPushSetupForm = async (req, res) => {
  let config = await PushConfig.findOne();
  if (!config) config = await PushConfig.create({});

  res.render("push_setup", {
    title: "Push Notification Setup",
    config,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

/* ------------------------------------------------------------------ */
/*  SAVE PUSH CONFIG -> POST /admin/notifications/push-setup           */
/* ------------------------------------------------------------------ */
exports.savePushConfig = async (req, res) => {
  try {
    const { provider, fcmServerKey, fcmProjectId, oneSignalAppId, oneSignalApiKey, isEnabled } = req.body;

    const data = { provider, fcmServerKey, fcmProjectId, oneSignalAppId, oneSignalApiKey, isEnabled: isEnabled === "on" };

    let config = await PushConfig.findOne();
    if (config) {
      await PushConfig.findByIdAndUpdate(config._id, data);
    } else {
      await PushConfig.create(data);
    }

    req.flash("success", "Push notification settings saved!");
    res.redirect("/admin/notifications/push-setup");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to save settings.");
    res.redirect("/admin/notifications/push-setup");
  }
};
