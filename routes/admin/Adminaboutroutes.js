const express = require("express");
const router = express.Router();

const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const createUploader = require("../../middleware/upload");
const { showAboutForm, saveAbout } = require("../../controllers/admin/Adminaboutcontroller");

const upload = createUploader("about");
const MODULE = "cms";

router.get("/", requireAdminAuth, checkPermission(MODULE, "isView"), showAboutForm);

// upload.any() instead of upload.single("heroImage") - field names are
// dynamic now (heroImage + cardIcon_0, cardIcon_1, ...) since each Info
// Card row can have its own uploaded icon.
router.post("/", requireAdminAuth, checkPermission(MODULE, "isEdit"), upload.any(), saveAbout);

module.exports = router;