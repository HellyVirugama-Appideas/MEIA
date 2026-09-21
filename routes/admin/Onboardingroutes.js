const express = require("express");
const router = express.Router();
const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const upload = require("../../middleware/upload");
const slideController = require("../../controllers/admin/Onboardingslidecontroller");

const MODULE = "cms";

router.get("/", requireAdminAuth, checkPermission(MODULE, "isView"), slideController.listSlides);
router.get("/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), slideController.newSlideForm);
router.post(
  "/",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  upload("onboarding").single("image"),
  slideController.createSlide
);
router.get("/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), slideController.editSlideForm);
router.post(
  "/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  upload("onboarding").single("image"),
  slideController.updateSlide
);
router.get("/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), slideController.deleteSlide);

module.exports = router;