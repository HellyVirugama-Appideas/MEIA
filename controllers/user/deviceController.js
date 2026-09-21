const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/*  REGISTER DEVICE TOKEN -> POST /api/device/register                 */
/*  Called by mobile app after login/app-open with FCM token            */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.registerDevice = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return error(res, "fcmToken is required.", 422);

    req.user.fcmToken = fcmToken;
    await req.user.save();

    return success(res, "Device registered for push notifications.");
  } catch (err) {
    next(err);
  }
};
