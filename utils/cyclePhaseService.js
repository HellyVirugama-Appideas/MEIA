// /*
//   Shared cycle-phase calculator.
//   Previously this logic lived only inside homeController.js. It is now
//   extracted so any screen that needs to know "what phase is the user in
//   today" (Home's "Your Cycle" card, Cosmic Inhale's "Cycle Focus" tag,
//   etc.) uses the exact same calculation and stays in sync.
// */

// // Maps the *display* name (shown in the app, e.g. "Bloom Phase") to the
// // phaseKey stored on CyclePhaseContent (admin-managed description lives there).
// const CYCLE_PHASE_KEY_MAP = {
//   "Menstrual Phase": "menstrual",
//   "Follicular Phase": "follicular",
//   "Ovulation Phase": "ovulation",
//   "Bloom Phase": "luteal",
// };

// /**
//  * @param {import('../models/User')} user - the logged-in user (needs user.cycleInfo.lastPeriodDate)
//  * @returns {{ phaseName: string, phaseKey: string, dayInCycle: number, totalDays: number } | null}
//  *          null when the user hasn't logged a last period date yet (onboarding incomplete)
//  */
// function getCurrentCyclePhase(user) {
//   if (!user?.cycleInfo?.lastPeriodDate) return null;

//   const daysSince = Math.floor(
//     (Date.now() - new Date(user.cycleInfo.lastPeriodDate)) /
//       (1000 * 60 * 60 * 24)
//   );

//   const totalDays = user.cycleInfo.averageCycleLength || 28;
//   const dayInCycle = (daysSince % totalDays) + 1;

//   const phaseName =
//     dayInCycle <= 5
//       ? "Menstrual Phase"
//       : dayInCycle <= 13
//       ? "Follicular Phase"
//       : dayInCycle <= 16
//       ? "Ovulation Phase"
//       : "Bloom Phase";

//   return {
//     phaseName,
//     phaseKey: CYCLE_PHASE_KEY_MAP[phaseName],
//     dayInCycle,
//     totalDays,
//   };
// }

// // Short label per phaseKey, used where space is tight (e.g. Cosmic Inhale's
// // "Cycle Focus: Bloom" row). Full names live in CyclePhaseContent.title (admin).
// const PHASE_SHORT_LABEL = {
//   menstrual: "Menstrual",
//   follicular: "Follicular",
//   ovulation: "Ovulation",
//   luteal: "Bloom",
// };

// module.exports = { getCurrentCyclePhase, CYCLE_PHASE_KEY_MAP, PHASE_SHORT_LABEL };


/*
  Shared cycle-phase calculator.
  Previously this logic lived only inside homeController.js. It is now
  extracted so any screen that needs to know "what phase is the user in
  today" (Home's "Your Cycle" card, Cosmic Inhale's "Cycle Focus" tag,
  etc.) uses the exact same calculation and stays in sync.
*/

// Maps the *display* name (shown in the app, e.g. "Bloom Phase") to the
// phaseKey stored on CyclePhaseContent (admin-managed description lives there).
const CYCLE_PHASE_KEY_MAP = {
  "Menstrual Phase": "menstrual",
  "Follicular Phase": "follicular",
  "Ovulation Phase": "ovulation",
  "Bloom Phase": "luteal",
};

/**
 * @param {import('../models/User')} user - the logged-in user (needs user.cycleInfo.lastPeriodDate)
 * @returns {{ phaseName: string, phaseKey: string, dayInCycle: number, totalDays: number } | null}
 *          null when the user hasn't logged a last period date yet (onboarding incomplete)
 */
function getCurrentCyclePhase(user) {
  if (!user?.cycleInfo?.lastPeriodDate) return null;

  const daysSince = Math.floor(
    (Date.now() - new Date(user.cycleInfo.lastPeriodDate)) /
      (1000 * 60 * 60 * 24)
  );

  const totalDays = user.cycleInfo.averageCycleLength || 28;
  const dayInCycle = (daysSince % totalDays) + 1;

  const phaseName =
    dayInCycle <= 5
      ? "Menstrual Phase"
      : dayInCycle <= 13
      ? "Follicular Phase"
      : dayInCycle <= 16
      ? "Ovulation Phase"
      : "Bloom Phase";

  return {
    phaseName,
    phaseKey: CYCLE_PHASE_KEY_MAP[phaseName],
    dayInCycle,
    totalDays,
  };
}

// Short label per phaseKey, used where space is tight (e.g. Cosmic Inhale's
// "Cycle Focus: Bloom" row). Full names live in CyclePhaseContent.title (admin).
const PHASE_SHORT_LABEL = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Bloom",
};

// "Seasons" mini-cards on the Rhythm dashboard (Renew / Rise / Bloom / Reflect).
// These are fixed presentation tokens (word + card color), not admin editorial
// content, so they live here as code constants rather than a DB field.
const SEASON_META = {
  menstrual: { shortLabel: "Renew", color: "#8B1E3F" },
  follicular: { shortLabel: "Rise", color: "#2F6B4F" },
  ovulation: { shortLabel: "Bloom", color: "#C9A15A" },
  luteal: { shortLabel: "Reflect", color: "#A9642B" },
};

/**
 * Given a day-in-cycle (1-based) and the user's total cycle length, returns
 * which phaseKey that day falls in. Same 5/13/16 boundaries used everywhere
 * else (getCurrentCyclePhase, getCurrentPhaseKey in rhythmController).
 */
function getPhaseKeyForDay(dayInCycle) {
  if (dayInCycle <= 5) return "menstrual";
  if (dayInCycle <= 13) return "follicular";
  if (dayInCycle <= 16) return "ovulation";
  return "luteal";
}

/**
 * Day range [start, end] (1-based, inclusive) for each phase, given the
 * user's total cycle length. Used for the "Day 1-5" / "Day 14-16" labels on
 * the Rhythm dashboard's Season cards. Computed live instead of stored, so
 * it automatically follows the user's own averageCycleLength.
 */
function getPhaseDayRanges(totalDays) {
  return {
    menstrual: { dayRangeStart: 1, dayRangeEnd: 5 },
    follicular: { dayRangeStart: 6, dayRangeEnd: 13 },
    ovulation: { dayRangeStart: 14, dayRangeEnd: 16 },
    luteal: { dayRangeStart: 17, dayRangeEnd: totalDays },
  };
}

module.exports = {
  getCurrentCyclePhase,
  CYCLE_PHASE_KEY_MAP,
  PHASE_SHORT_LABEL,
  SEASON_META,
  getPhaseKeyForDay,
  getPhaseDayRanges,
};