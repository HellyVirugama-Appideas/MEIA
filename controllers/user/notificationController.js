const Notification = require("../../models/Notification");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/*  1. GET NOTIFICATIONS -> GET /api/notifications                     */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return success(res, "Notifications fetched successfully.", {
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. MARK AS READ -> PATCH /api/notifications/:id/read               */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return error(res, "Notification not found.", 404);
    }

    return success(res, "Notification marked as read.", { notification });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. MARK ALL AS READ -> PATCH /api/notifications/read-all           */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    return success(res, "All notifications marked as read.");
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  4. DELETE NOTIFICATION -> DELETE /api/notifications/:id            */
/*  (protected) - swipe to delete                                       */
/* ------------------------------------------------------------------ */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return error(res, "Notification not found.", 404);
    }

    return success(res, "Notification deleted successfully.");
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  5. CLEAR ALL NOTIFICATIONS -> DELETE /api/notifications            */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    return success(res, "All notifications cleared.");
  } catch (err) {
    next(err);
  }
};