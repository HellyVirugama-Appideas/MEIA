const express = require("express");
const router = express.Router();

const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const contactController = require("../../controllers/admin/Contactcontroller");

const MODULE = "cms";

router.get("/", requireAdminAuth, checkPermission(MODULE, "isView"), contactController.listMessages);
router.get("/:id", requireAdminAuth, checkPermission(MODULE, "isView"), contactController.viewMessage);
router.post("/:id/status", requireAdminAuth, checkPermission(MODULE, "isEdit"), contactController.updateStatus);

module.exports = router;