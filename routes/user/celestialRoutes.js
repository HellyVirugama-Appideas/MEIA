// const express = require("express");
// const router = express.Router();
// const { protect } = require("../../middleware/auth");
// const {
//   getCelestialOverview,
//   getBirthChart,
//   getMoonPhaseDetail,
//   getPlanetDetail,
// } = require("../../controllers/user/celestialController");

// router.get("/", protect, getCelestialOverview);
// router.get("/birth-chart", protect, getBirthChart);
// router.get("/moon-phase", protect, getMoonPhaseDetail);
// router.get("/planets/:name", protect, getPlanetDetail);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const {
  getCelestialOverview,
  getBirthChart,
  recalculateBirthChart,
  getMoonPhaseDetail,
  getPlanetDetail,
} = require("../../controllers/user/celestialController");

router.get("/", protect, getCelestialOverview);
router.get("/birth-chart", protect, getBirthChart);
// FIX: controller function existed but was never wired to a route -
// "Recalculate" action on Birth Chart screen (e.g. after user edits
// birth info) had nowhere to call.
router.post("/recalculate-chart", protect, recalculateBirthChart);
router.get("/moon-phase", protect, getMoonPhaseDetail);
router.get("/planets/:name", protect, getPlanetDetail);

module.exports = router;