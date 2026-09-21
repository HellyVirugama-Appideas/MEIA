const express = require("express");
const router = express.Router();
const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const upload = require("../../middleware/upload");

const contentController = require("../../controllers/admin/Contentcontroller");
const MODULE = "content";

/* ===================== READINGS (Moon Phase content) ===================== */
router.get("/moon-phases", requireAdminAuth, checkPermission(MODULE, "isView"), contentController.listMoonPhases);
router.get("/moon-phases/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.editMoonPhaseForm);
router.post("/moon-phases/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.updateMoonPhase);

/* ===================== PLANETS ===================== */
router.get("/planets", requireAdminAuth, checkPermission(MODULE, "isView"), contentController.listPlanets);
router.get("/planets/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), contentController.newPlanetForm);
router.post("/planets", requireAdminAuth, checkPermission(MODULE, "isAdd"), contentController.createPlanet);
router.get("/planets/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.editPlanetForm);
router.post("/planets/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.updatePlanet);
router.get("/planets/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), contentController.deletePlanet);

/* ===================== RITUAL CONTENT ===================== */
router.get("/ritual", requireAdminAuth, checkPermission(MODULE, "isView"), contentController.listRitualSteps);
router.get("/ritual/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), contentController.newRitualStepForm);
router.post(
  "/ritual",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  upload("ritual").single("image"),
  contentController.createRitualStep
);
router.get("/ritual/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.editRitualStepForm);
router.post(
  "/ritual/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  upload("ritual").single("image"),
  contentController.updateRitualStep
);
router.get("/ritual/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), contentController.deleteRitualStep);

/* ===================== TAROT CARDS ===================== */
router.get("/tarot/settings", requireAdminAuth, checkPermission(MODULE, "isView"), contentController.getTarotSettings);
router.post("/tarot/settings", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.updateTarotSettings);

router.get("/tarot", requireAdminAuth, checkPermission(MODULE, "isView"), contentController.listTarotCards);
router.get("/tarot/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), contentController.newTarotCardForm);
router.post(
  "/tarot",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  upload("tarot").single("image"),
  contentController.createTarotCard
);
router.get("/tarot/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.editTarotCardForm);
router.post(
  "/tarot/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  upload("tarot").single("image"),
  contentController.updateTarotCard
);
router.get("/tarot/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), contentController.deleteTarotCard);

/* ===================== BREATHING SESSIONS (Cosmic Inhale) ===================== */
router.get("/breathing", requireAdminAuth, checkPermission(MODULE, "isView"), contentController.listBreathingSessions);
router.get("/breathing/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), contentController.newBreathingSessionForm);
router.post("/breathing", requireAdminAuth, checkPermission(MODULE, "isAdd"), contentController.createBreathingSession);
router.get("/breathing/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.editBreathingSessionForm);
router.post("/breathing/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), contentController.updateBreathingSession);
router.get("/breathing/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), contentController.deleteBreathingSession);

module.exports = router;