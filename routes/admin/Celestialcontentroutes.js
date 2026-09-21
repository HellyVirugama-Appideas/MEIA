const express = require("express");
const router = express.Router();
const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const celestialContentController = require("../../controllers/admin/Celestialcontentcontroller");
const createUploader = require("../../middleware/upload");
const upload = createUploader("moon-phases");
const uploadZodiac = createUploader("zodiac-signs");
const uploadPlanet = createUploader("planets");

const MODULE = "content";

/* ===================== MOON PHASE INFO ===================== */
router.get("/moon-phases", requireAdminAuth, checkPermission(MODULE, "isView"), celestialContentController.listMoonPhases);
router.get("/moon-phases/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), celestialContentController.editMoonPhaseForm);
router.post("/moon-phases/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), celestialContentController.updateMoonPhase);

/* ===================== PLANETS ===================== */
router.get("/planets", requireAdminAuth, checkPermission(MODULE, "isView"), celestialContentController.listPlanets);
router.get("/planets/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), celestialContentController.newPlanetForm);
router.post(
  "/planets",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  uploadPlanet.single("icon"),
  celestialContentController.createPlanet
);
router.get("/planets/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), celestialContentController.editPlanetForm);
router.post(
  "/planets/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  uploadPlanet.single("icon"),
  celestialContentController.updatePlanet
);
router.get("/planets/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), celestialContentController.deletePlanet);

/* ===================== UPCOMING MOON EVENTS ===================== */
router.get("/moon-events", requireAdminAuth, checkPermission(MODULE, "isView"), celestialContentController.listMoonEvents);
router.get("/moon-events/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), celestialContentController.newMoonEventForm);
router.post("/moon-events", requireAdminAuth, checkPermission(MODULE, "isAdd"), celestialContentController.createMoonEvent);
router.get("/moon-events/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), celestialContentController.editMoonEventForm);
router.post("/moon-events/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), celestialContentController.updateMoonEvent);
router.get("/moon-events/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), celestialContentController.deleteMoonEvent);

/* ===================== ZODIAC SIGN CONTENT ===================== */
router.get("/zodiac-signs", requireAdminAuth, checkPermission(MODULE, "isView"), celestialContentController.listZodiacSigns);
router.get("/zodiac-signs/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), celestialContentController.newZodiacSignForm);
router.post(
  "/zodiac-signs",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  uploadZodiac.single("icon"),
  celestialContentController.createZodiacSign
);
router.get("/zodiac-signs/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), celestialContentController.editZodiacSignForm);
router.post(
  "/zodiac-signs/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  uploadZodiac.single("icon"),
  celestialContentController.updateZodiacSign
);

/* ===================== BIRTH CHART PERSONALITY CONTENT ===================== */
router.get(
  "/birth-chart-personality",
  requireAdminAuth,
  checkPermission(MODULE, "isView"),
  celestialContentController.listPersonalityContent
);
router.get(
  "/birth-chart-personality/add",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  celestialContentController.newPersonalityContentForm
);
router.post(
  "/birth-chart-personality",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  celestialContentController.createPersonalityContent
);
router.get(
  "/birth-chart-personality/edit/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  celestialContentController.editPersonalityContentForm
);
router.post(
  "/birth-chart-personality/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  celestialContentController.updatePersonalityContent
);

/* ===================== POWERED BY CONTENT ===================== */
router.get("/powered-by", requireAdminAuth, checkPermission(MODULE, "isView"), celestialContentController.listPoweredBy);
router.get("/powered-by/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), celestialContentController.newPoweredByForm);
router.post("/powered-by", requireAdminAuth, checkPermission(MODULE, "isAdd"), celestialContentController.createPoweredBy);
router.get("/powered-by/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), celestialContentController.editPoweredByForm);
router.post("/powered-by/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), celestialContentController.updatePoweredBy);
router.get("/powered-by/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), celestialContentController.deletePoweredBy);

module.exports = router;