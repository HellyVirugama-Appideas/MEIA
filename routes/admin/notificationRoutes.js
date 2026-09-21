const express = require("express");
const router = express.Router();
const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const notificationController = require("../../controllers/admin/Notificationcontroller");

const MODULE = "notifications";

router.get("/", requireAdminAuth, checkPermission(MODULE, "isView"), notificationController.listNotifications);
router.get("/new", requireAdminAuth, checkPermission(MODULE, "isAdd"), notificationController.composeForm);
router.post("/send", requireAdminAuth, checkPermission(MODULE, "isAdd"), notificationController.sendNotification);

router.get("/push-setup", requireAdminAuth, checkPermission(MODULE, "isView"), notificationController.getPushSetupForm);
router.post("/push-setup", requireAdminAuth, checkPermission(MODULE, "isEdit"), notificationController.savePushConfig);

module.exports = router;