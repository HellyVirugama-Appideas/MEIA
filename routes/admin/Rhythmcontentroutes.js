const express = require("express");
const router = express.Router();
const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const rhythmContentController = require("../../controllers/admin/rhythmContentController");
const createUploader = require("../../middleware/upload"); // apna actual path check kar lena

const upload = createUploader("rhythm");
const MODULE = "rhythm";

/* ===================== CYCLE PHASE CONTENT ===================== */
router.get("/cycle-phases", requireAdminAuth, checkPermission(MODULE, "isView"), rhythmContentController.listCyclePhases);
router.get("/cycle-phases/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), rhythmContentController.newCyclePhaseForm);
router.post(
  "/cycle-phases",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  upload.single("image"),
  rhythmContentController.createCyclePhase
);
router.get("/cycle-phases/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), rhythmContentController.editCyclePhaseForm);
router.post(
  "/cycle-phases/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  upload.single("image"),
  rhythmContentController.updateCyclePhase
);

/* ===================== ELEMENTAL STATE CONTENT ===================== */
router.get("/elemental-states", requireAdminAuth, checkPermission(MODULE, "isView"), rhythmContentController.listElementalStates);
router.get(
  "/elemental-states/edit/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  rhythmContentController.editElementalStateForm
);
router.post(
  "/elemental-states/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  upload.single("image"),
  rhythmContentController.updateElementalState
);

/* ===================== PHYSICAL SYMPTOM OPTIONS ===================== */
// NOTE: in the original file these routes had NO auth middleware at all —
// anyone with the URL, logged in or not, could hit them. Fixed here.
router.get("/symptom-options", requireAdminAuth, checkPermission(MODULE, "isView"), rhythmContentController.listSymptomOptions);
router.get("/symptom-options/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), rhythmContentController.newSymptomOptionForm);
router.post(
  "/symptom-options",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  upload.single("icon"),
  rhythmContentController.createSymptomOption
);
router.get(
  "/symptom-options/edit/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  rhythmContentController.editSymptomOptionForm
);
router.post(
  "/symptom-options/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  upload.single("icon"),
  rhythmContentController.updateSymptomOption
);
router.get(
  "/symptom-options/delete/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isDelete"),
  rhythmContentController.deleteSymptomOption
);

module.exports = router;