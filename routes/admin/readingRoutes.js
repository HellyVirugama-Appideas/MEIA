const express = require("express");
const router = express.Router();
const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const readingController = require("../../controllers/admin/readingController");
const createUploader = require("../../middleware/upload"); // apna actual path check kar lena

const upload = createUploader("readings");
const MODULE = "readings";

/* ===================== DAILY READINGS ===================== */
router.get("/daily", requireAdminAuth, checkPermission(MODULE, "isView"), readingController.listDaily);
router.get("/daily/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), readingController.newDailyForm);
router.post(
  "/daily",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  upload.single("heroImage"),
  readingController.createDaily
);
router.get("/daily/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), readingController.editDailyForm);
router.post(
  "/daily/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  upload.single("heroImage"),
  readingController.updateDaily
);
router.get("/daily/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), readingController.deleteDaily);

/* ===================== WEEKLY READINGS ===================== */
router.get("/weekly", requireAdminAuth, checkPermission(MODULE, "isView"), readingController.listWeekly);
router.get("/weekly/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), readingController.newWeeklyForm);
router.post(
  "/weekly",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  upload.single("heroImage"),
  readingController.createWeekly
);
router.get("/weekly/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), readingController.editWeeklyForm);
router.post(
  "/weekly/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  upload.single("heroImage"),
  readingController.updateWeekly
);
router.get("/weekly/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), readingController.deleteWeekly);

module.exports = router;