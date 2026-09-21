// const PeriodLog = require("../../models/PeriodLog");
// const SymptomLog = require("../../models/SymptomLog");
// const PhysicalSymptomOption = require("../../models/PhysicalSymptomOption");
// const CyclePhaseContent = require("../../models/CyclePhaseContent");
// const ElementalStateContent = require("../../models/ElementalStateContent");
// const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
// const { calculateMoonPhase } = require("../../utils/Astrologyservice");
// const { success, error } = require("../../utils/response");

// const startOfDay = (d) => {
//   const date = new Date(d);
//   date.setUTCHours(0, 0, 0, 0); // UTC use karo
//   return date;
// };

// // Same display-name -> phaseKey map jo homeController.js me hai, taaki
// // Home aur Rhythm dono screens par phase calculation exactly consistent rahe.
// const CYCLE_PHASE_KEY_MAP = {
//   "Menstrual Phase": "menstrual",
//   "Follicular Phase": "follicular",
//   "Ovulation Phase": "ovulation",
//   "Bloom Phase": "luteal",
// };

// const PHASE_SEASON_LABEL = {
//   menstrual: "Renew",
//   follicular: "Rise",
//   ovulation: "Bloom",
//   luteal: "Reflect",
// };


// const PHASE_DAY_RANGES = {
//   menstrual: { start: 1, end: 5 },
//   follicular: { start: 6, end: 13 },
//   ovulation: { start: 14, end: 16 },
//   luteal: { start: 17, end: null }, // end = totalDays, resolve per-user
// };

// // dayInCycle se phase ka display name + DB key nikalta hai - same
// // boundaries (5 / 13 / 16) jo homeController.js me use ho rahe hain.
// const getPhaseForDay = (dayInCycle) => {
//   const phaseKey =
//     dayInCycle <= PHASE_DAY_RANGES.menstrual.end
//       ? "menstrual"
//       : dayInCycle <= PHASE_DAY_RANGES.follicular.end
//       ? "follicular"
//       : dayInCycle <= PHASE_DAY_RANGES.ovulation.end
//       ? "ovulation"
//       : "luteal";
//   const phaseName = `${PHASE_SEASON_LABEL[phaseKey]} Phase`; // e.g. "Bloom Phase"
//   return { phaseName, phaseKey };
// };

// /* ------------------------------------------------------------------ */
// /*  1. GET RHYTHM DASHBOARD -> GET /api/rhythm                         */
// /*  Figma: "Rhythm" main screen (Bloom Phase card, week strip, period   */
// /*  tracking, symptoms tracking, seasons grid). Sab kuch DB se aata hai */
// /*  - kahin bhi phase description/image/tips hardcoded nahi hai.        */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// // exports.getRhythmDashboard = async (req, res, next) => {
// //   try {
// //     const user = req.user;
// //     const today = startOfDay(new Date());

// //     const periodLength = user.cycleInfo?.averagePeriodLength || 5;
// //     const totalDays = user.cycleInfo?.averageCycleLength || 28;
// //     let lastPeriodDate = null;
// //     let dayInCycle = null;
// //     let phaseName = null;
// //     let phaseKey = null;

// //     if (user.cycleInfo && user.cycleInfo.lastPeriodDate) {
// //       lastPeriodDate = startOfDay(user.cycleInfo.lastPeriodDate);
// //       const daysSince = Math.floor((Date.now() - lastPeriodDate) / (1000 * 60 * 60 * 24));
// //       dayInCycle = (daysSince % totalDays) + 1;
// //       const phase = getPhaseForDay(dayInCycle);
// //       phaseName = phase.phaseName;
// //       phaseKey = phase.phaseKey;
// //     }

// //     // FIX: Home ke "Bloom Phase" top card me moon icon + moon-phase data bhi
// //     // dikhta hai - Rhythm ka wahi top card pehle sirf cycle info bhej raha
// //     // tha, moonPhase field response me tha hi nahi. Ab Home jaisa hi
// //     // calculateMoonPhase() + MoonPhaseInfo se live moon data bhi bhej rahe hain.
// //     const moonPhase = calculateMoonPhase(new Date(), user.timezone || "Asia/Kolkata");

// //     const [currentPhaseContent, allPhases, latestPeriod, todaySymptoms, moonPhaseContent] =
// //       await Promise.all([
// //         phaseKey ? CyclePhaseContent.findOne({ phaseKey }) : null,
// //         CyclePhaseContent.find().sort({ phaseKey: 1 }),
// //         PeriodLog.findOne({ user: user._id }).sort({ startDate: -1 }),
// //         SymptomLog.findOne({ user: user._id, date: today }),
// //         MoonPhaseInfo.findOne({ phaseName: moonPhase.phaseName }),
// //       ]);

// //     const moonPhaseWithKeywords = {
// //       ...moonPhase,
// //       keywords: moonPhaseContent?.keywords || [],
// //       // FIX: top wala bada card ab REAL moon phase dikhayega (Waning
// //       // Gibbous etc, astrology wala) - dayInCycle/totalDays yahin add kar
// //       // diya taaki card "Waning Gibbous — Day 1 of 28" bana sake, bina
// //       // cyclePhase object se alag se merge kiye.
// //       dayInCycle,
// //       totalDays,
// //     };

// //     /* ---------- "Bloom Phase" card - description/image/tips DB se ---------- */
// //     const cyclePhase = phaseName
// //       ? {
// //           dayInCycle,
// //           totalDays,
// //           phaseKey,
// //           phaseName,
// //           description: currentPhaseContent?.description || null,
// //           image: currentPhaseContent?.image || null,
// //           tips: currentPhaseContent?.tips || [],
// //         }
// //       : null;

// //     /* ---------- Seasons grid (4 fixed phases, admin-managed content) ---------- */
// //     // dayRangeStart/End sirf date-math hai (same boundaries jaisa upar), koi
// //     // content yaha hardcoded nahi - title/description/image/tips sab DB se.
// //     const phaseDayRanges = {
// //       menstrual: { start: 1, end: 5 },
// //       follicular: { start: 6, end: 13 },
// //       ovulation: { start: 14, end: 16 },
// //       luteal: { start: 17, end: totalDays },
// //     };
// //     const seasons = allPhases.map((phase) => {
// //       const range = phaseDayRanges[phase.phaseKey] || {};
// //       return {
// //         _id: phase._id,
// //         phaseKey: phase.phaseKey,
// //         title: phase.title,
// //         description: phase.description,
// //         image: phase.image,
// //         tips: phase.tips,
// //         isActive: phase.isActive,
// //         dayRangeStart: range.start,
// //         dayRangeEnd: range.end,
// //         isCurrent: phase.phaseKey === phaseKey,
// //       };
// //     });

// //     /* ---------- Ovulation + Fertile window + next period ---------- */
// //     let ovulationDate = null;
// //     let fertileWindow = null;
// //     let nextPeriodDate = null;
// //     let daysUntilNextPeriod = null;

// //     if (lastPeriodDate) {
// //       const ovulationDay = new Date(lastPeriodDate);
// //       ovulationDay.setDate(ovulationDay.getDate() + (totalDays - 14));
// //       const fertileStart = new Date(ovulationDay);
// //       fertileStart.setDate(fertileStart.getDate() - 5);
// //       ovulationDate = ovulationDay;
// //       fertileWindow = { start: fertileStart, end: ovulationDay };

// //       const nextPeriod = new Date(lastPeriodDate);
// //       nextPeriod.setDate(nextPeriod.getDate() + totalDays);
// //       nextPeriodDate = nextPeriod;
// //       daysUntilNextPeriod = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
// //     }

// //     /* ---------- Week strip (top calendar row, today ke aas-paas) ---------- */
// //     const weekDays = [];
// //     for (let i = -3; i <= 3; i++) {
// //       const d = new Date(today);
// //       d.setDate(d.getDate() + i);

// //       let dayPhaseKey = null;
// //       let isPeriodDay = false;
// //       let isFertileDay = false;
// //       let isOvulationDay = false;

// //       if (lastPeriodDate) {
// //         const daysSince = Math.floor((d - lastPeriodDate) / (1000 * 60 * 60 * 24));
// //         const dic = (((daysSince % totalDays) + totalDays) % totalDays) + 1;
// //         dayPhaseKey = getPhaseForDay(dic).phaseKey;
// //         isPeriodDay = dic <= periodLength;

// //         const cyclesElapsed = Math.floor(daysSince / totalDays);
// //         const thisOvulation = new Date(lastPeriodDate);
// //         thisOvulation.setDate(
// //           thisOvulation.getDate() + cyclesElapsed * totalDays + (totalDays - 14)
// //         );
// //         const thisFertileStart = new Date(thisOvulation);
// //         thisFertileStart.setDate(thisFertileStart.getDate() - 5);

// //         isOvulationDay = d.getTime() === startOfDay(thisOvulation).getTime();
// //         isFertileDay =
// //           d.getTime() >= startOfDay(thisFertileStart).getTime() &&
// //           d.getTime() <= startOfDay(thisOvulation).getTime();
// //       }

// //       weekDays.push({
// //         date: d,
// //         day: d.getDate(),
// //         weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
// //         isToday: d.getTime() === today.getTime(),
// //         phaseKey: dayPhaseKey,
// //         isPeriodDay,
// //         isFertileDay,
// //         isOvulationDay,
// //       });
// //     }

// //     /* ---------- Period Tracking card ---------- */
// //     const periodTracking = latestPeriod
// //       ? {
// //           id: latestPeriod._id,
// //           startDate: latestPeriod.startDate,
// //           endDate: latestPeriod.endDate,
// //           flow: latestPeriod.flow,
// //           notes: latestPeriod.notes,
// //           bleedingDays: latestPeriod.endDate
// //             ? Math.round(
// //                 (new Date(latestPeriod.endDate) - new Date(latestPeriod.startDate)) /
// //                   (1000 * 60 * 60 * 24)
// //               ) + 1
// //             : periodLength,
// //           isOnPeriod: dayInCycle !== null && dayInCycle <= periodLength,
// //           nextPeriodDate,
// //           daysUntilNextPeriod,
// //         }
// //       : null;

// //     /* ---------- Symptoms Tracking card ---------- */
// //     const moodEmojiMap = {
// //       Happy: "😊",
// //       Fun: "😄",
// //       Sad: "😢",
// //       Shocked: "😮",
// //       Angry: "😠",
// //       Frustrated: "😣",
// //     };
// //     const symptomsTracking = todaySymptoms
// //       ? {
// //           mood: todaySymptoms.mood,
// //           moodEmoji: moodEmojiMap[todaySymptoms.mood] || null,
// //           sleepHours: todaySymptoms.sleepHours,
// //           energy: todaySymptoms.energy, // Number 0-100
// //           physicalSymptoms: todaySymptoms.physicalSymptoms,
// //           feelingNote: todaySymptoms.feelingNote,
// //         }
// //       : null;

// //     return success(res, "Rhythm dashboard fetched.", {
// //       today,
// //       cycleInfo: user.cycleInfo,
// //       dayInCycle,
// //       totalDays,
// //       cyclePhase,
// //       moonPhase: moonPhaseWithKeywords,
// //       ovulationDate,
// //       fertileWindow,
// //       weekDays,
// //       periodTracking,
// //       symptomsTracking,
// //       seasons,
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// exports.getRhythmDashboard = async (req, res, next) => {
//   try {
//     const user = req.user;
//     const today = startOfDay(new Date());

//     const periodLength = user.cycleInfo?.averagePeriodLength || 5;
//     const totalDays = user.cycleInfo?.averageCycleLength || 28;
//     let lastPeriodDate = null;
//     let dayInCycle = null;
//     let phaseName = null;
//     let phaseKey = null;

//     if (user.cycleInfo && user.cycleInfo.lastPeriodDate) {
//       lastPeriodDate = startOfDay(user.cycleInfo.lastPeriodDate);
//       const daysSince = Math.floor((Date.now() - lastPeriodDate) / (1000 * 60 * 60 * 24));
//       dayInCycle = (daysSince % totalDays) + 1;
//       const phase = getPhaseForDay(dayInCycle);
//       phaseName = phase.phaseName;
//       phaseKey = phase.phaseKey;
//     }

//     // FIX: Home ke "Bloom Phase" top card me moon icon + moon-phase data bhi
//     // dikhta hai - Rhythm ka wahi top card pehle sirf cycle info bhej raha
//     // tha, moonPhase field response me tha hi nahi. Ab Home jaisa hi
//     // calculateMoonPhase() + MoonPhaseInfo se live moon data bhi bhej rahe hain.
//     const moonPhase = calculateMoonPhase(new Date(), user.timezone || "Asia/Kolkata");

//     const [currentPhaseContent, allPhases, latestPeriod, todaySymptoms, moonPhaseContent] =
//       await Promise.all([
//         phaseKey ? CyclePhaseContent.findOne({ phaseKey }) : null,
//         CyclePhaseContent.find().sort({ phaseKey: 1 }),
//         PeriodLog.findOne({ user: user._id }).sort({ startDate: -1 }),
//         SymptomLog.findOne({ user: user._id, date: today }),
//         MoonPhaseInfo.findOne({ phaseName: moonPhase.phaseName }),
//       ]);

//     const moonPhaseWithKeywords = {
//       ...moonPhase,
//       keywords: moonPhaseContent?.keywords || [],
//       // FIX: top wala bada card ab REAL moon phase dikhayega (Waning
//       // Gibbous etc, astrology wala) - dayInCycle/totalDays yahin add kar
//       // diya taaki card "Waning Gibbous — Day 1 of 28" bana sake, bina
//       // cyclePhase object se alag se merge kiye.
//       dayInCycle,
//       totalDays,
//     };

//     /* ---------- "Bloom Phase" card - description/image/tips DB se ---------- */
//     const cyclePhase = phaseName
//       ? {
//           dayInCycle,
//           totalDays,
//           phaseKey,
//           phaseName,               // e.g. "Bloom Phase"
//           seasonLabel: PHASE_SEASON_LABEL[phaseKey], // e.g. "Bloom"
//           description: currentPhaseContent?.description || null,
//           image: currentPhaseContent?.image || null,
//           tips: currentPhaseContent?.tips || [],
//         }
//       : null;

//     /* ---------- Seasons grid (Renew / Rise / Bloom / Reflect) ---------- */
//     // FIX: pehle sirf jitne CyclePhaseContent documents DB me the utne hi
//     // seasons aa rahe the (agar 1 doc hai to 1 hi season). Ab hamesha
//     // FIXED 4 phases (Renew/Rise/Bloom/Reflect) return honge - DB me jo
//     // document mile uska content (title/description/image/tips) merge ho
//     // jayega, na mile to null/empty ke sath bhi entry zaroor aayegi.
//     const ALL_PHASE_KEYS = ["menstrual", "follicular", "ovulation", "luteal"];
//     const seasons = ALL_PHASE_KEYS.map((key) => {
//       const phase = allPhases.find((p) => p.phaseKey === key) || null;
//       const range = PHASE_DAY_RANGES[key] || {};
//       return {
//         _id: phase?._id || null,
//         phaseKey: key,
//         seasonLabel: PHASE_SEASON_LABEL[key], // Renew/Rise/Bloom/Reflect
//         title: phase?.title || `${PHASE_SEASON_LABEL[key]} Phase`,
//         description: phase?.description || null,
//         image: phase?.image || null,
//         tips: phase?.tips || [],
//         isActive: phase?.isActive ?? false,
//         dayRangeStart: range.start,
//         dayRangeEnd: range.end === null ? totalDays : range.end,
//         isCurrent: key === phaseKey,
//       };
//     });

//     /* ---------- Ovulation + Fertile window + next period ---------- */
//     let ovulationDate = null;
//     let fertileWindow = null;
//     let nextPeriodDate = null;
//     let daysUntilNextPeriod = null;

//     if (lastPeriodDate) {
//       const ovulationDay = new Date(lastPeriodDate);
//       ovulationDay.setDate(ovulationDay.getDate() + (totalDays - 14));
//       const fertileStart = new Date(ovulationDay);
//       fertileStart.setDate(fertileStart.getDate() - 5);
//       ovulationDate = ovulationDay;
//       fertileWindow = { start: fertileStart, end: ovulationDay };

//       const nextPeriod = new Date(lastPeriodDate);
//       nextPeriod.setDate(nextPeriod.getDate() + totalDays);
//       nextPeriodDate = nextPeriod;
//       daysUntilNextPeriod = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
//     }

//     /* ---------- Week strip (top calendar row, today ke aas-paas) ---------- */
//     const weekDays = [];
//     for (let i = -3; i <= 3; i++) {
//       const d = new Date(today);
//       d.setDate(d.getDate() + i);

//       let dayPhaseKey = null;
//       let isPeriodDay = false;
//       let isFertileDay = false;
//       let isOvulationDay = false;

//       if (lastPeriodDate) {
//         const daysSince = Math.floor((d - lastPeriodDate) / (1000 * 60 * 60 * 24));
//         const dic = (((daysSince % totalDays) + totalDays) % totalDays) + 1;
//         dayPhaseKey = getPhaseForDay(dic).phaseKey;
//         isPeriodDay = dic <= periodLength;

//         const cyclesElapsed = Math.floor(daysSince / totalDays);
//         const thisOvulation = new Date(lastPeriodDate);
//         thisOvulation.setDate(
//           thisOvulation.getDate() + cyclesElapsed * totalDays + (totalDays - 14)
//         );
//         const thisFertileStart = new Date(thisOvulation);
//         thisFertileStart.setDate(thisFertileStart.getDate() - 5);

//         isOvulationDay = d.getTime() === startOfDay(thisOvulation).getTime();
//         isFertileDay =
//           d.getTime() >= startOfDay(thisFertileStart).getTime() &&
//           d.getTime() <= startOfDay(thisOvulation).getTime();
//       }

//       weekDays.push({
//         date: d,
//         day: d.getDate(),
//         weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
//         isToday: d.getTime() === today.getTime(),
//         phaseKey: dayPhaseKey,
//         isPeriodDay,
//         isFertileDay,
//         isOvulationDay,
//       });
//     }

//     /* ---------- Period Tracking card ---------- */
//     const periodTracking = latestPeriod
//       ? {
//           id: latestPeriod._id,
//           startDate: latestPeriod.startDate,
//           endDate: latestPeriod.endDate,
//           flow: latestPeriod.flow,
//           notes: latestPeriod.notes,
//           bleedingDays: latestPeriod.endDate
//             ? Math.round(
//                 (new Date(latestPeriod.endDate) - new Date(latestPeriod.startDate)) /
//                   (1000 * 60 * 60 * 24)
//               ) + 1
//             : periodLength,
//           isOnPeriod: dayInCycle !== null && dayInCycle <= periodLength,
//           nextPeriodDate,
//           daysUntilNextPeriod,
//         }
//       : null;

//     /* ---------- Symptoms Tracking card ---------- */
//     const moodEmojiMap = {
//       Happy: "😊",
//       Fun: "😄",
//       Sad: "😢",
//       Shocked: "😮",
//       Angry: "😠",
//       Frustrated: "😣",
//     };
//     const symptomsTracking = todaySymptoms
//       ? {
//           mood: todaySymptoms.mood,
//           moodEmoji: moodEmojiMap[todaySymptoms.mood] || null,
//           sleepHours: todaySymptoms.sleepHours,
//           energy: todaySymptoms.energy, // Number 0-100
//           physicalSymptoms: todaySymptoms.physicalSymptoms,
//           feelingNote: todaySymptoms.feelingNote,
//         }
//       : null;

//     return success(res, "Rhythm dashboard fetched.", {
//       today,
//       cycleInfo: user.cycleInfo,
//       dayInCycle,
//       totalDays,
//       cyclePhase,
//       moonPhase: moonPhaseWithKeywords,
//       ovulationDate,
//       fertileWindow,
//       weekDays,
//       periodTracking,
//       symptomsTracking,
//       seasons,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  2. GET CALENDAR -> GET /api/rhythm/calendar?month=7&year=2026      */
// /*  Figma: "Rhythm - Dates" calendar screen                             */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.getCalendar = async (req, res, next) => {
//   try {
//     const user = req.user;
//     const month = parseInt(req.query.month) || new Date().getMonth() + 1;
//     const year = parseInt(req.query.year) || new Date().getFullYear();

//     const rangeStart = new Date(year, month - 1, 1);
//     const rangeEnd = new Date(year, month, 0);

//     const periods = await PeriodLog.find({
//       user: user._id,
//       startDate: { $lte: rangeEnd },
//       $or: [{ endDate: { $gte: rangeStart } }, { endDate: null }],
//     });

//     let dailyPhases = [];
//     let ovulationDate = null;
//     let fertileWindow = null;

//     if (user.cycleInfo && user.cycleInfo.lastPeriodDate) {
//       const cycleLen = user.cycleInfo.averageCycleLength || 28;
//       const periodLength = user.cycleInfo.averagePeriodLength || 5;
//       const lastPeriodDate = startOfDay(user.cycleInfo.lastPeriodDate);

//       const ovulationDay = new Date(lastPeriodDate);
//       ovulationDay.setDate(ovulationDay.getDate() + (cycleLen - 14));
//       const fertileStart = new Date(ovulationDay);
//       fertileStart.setDate(fertileStart.getDate() - 5);
//       ovulationDate = ovulationDay;
//       fertileWindow = { start: fertileStart, end: ovulationDay };

//       const daysInMonth = rangeEnd.getDate();
//       for (let d = 1; d <= daysInMonth; d++) {
//         const date = new Date(year, month - 1, d);
//         const daysSince = Math.floor((date - lastPeriodDate) / (1000 * 60 * 60 * 24));
//         const dayInCycle = (((daysSince % cycleLen) + cycleLen) % cycleLen) + 1;
//         const phaseKey = getPhaseForDay(dayInCycle).phaseKey;

//         const cyclesElapsed = Math.floor(daysSince / cycleLen);
//         const thisCycleOvulation = new Date(lastPeriodDate);
//         thisCycleOvulation.setDate(
//           thisCycleOvulation.getDate() + cyclesElapsed * cycleLen + (cycleLen - 14)
//         );
//         const thisFertileStart = new Date(thisCycleOvulation);
//         thisFertileStart.setDate(thisFertileStart.getDate() - 5);

//         dailyPhases.push({
//           date,
//           phaseKey,
//           isPeriodDay: dayInCycle <= periodLength,
//           isOvulationDay: date.getTime() === startOfDay(thisCycleOvulation).getTime(),
//           isFertileDay:
//             date.getTime() >= startOfDay(thisFertileStart).getTime() &&
//             date.getTime() <= startOfDay(thisCycleOvulation).getTime(),
//         });
//       }
//     }

//     return success(res, "Calendar fetched.", {
//       month,
//       year,
//       periods,
//       ovulationDate,
//       fertileWindow,
//       dailyPhases,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  3. LOG PERIOD -> POST /api/rhythm/period                            */
// /*  Figma: "Edit Period Tracking" screen                                */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.logPeriod = async (req, res, next) => {
//   try {
//     const { startDate, endDate, flow, notes } = req.body;
//     if (!startDate) return error(res, "Start date is required.", 422);

//     // Schema ke exact enum ke sath match (Light / Medium / Heavy)
//     if (flow && !["Light", "Medium", "Heavy"].includes(flow)) {
//       return error(res, "Flow must be one of: Light, Medium, Heavy.", 422);
//     }

//     const periodLog = await PeriodLog.create({
//       user: req.user._id,
//       startDate,
//       endDate,
//       flow,
//       notes,
//     });

//     if (!req.user.cycleInfo) req.user.cycleInfo = {};
//     req.user.cycleInfo.lastPeriodDate = startDate;
//     await req.user.save();

//     return success(res, "Period tracking saved.", { periodLog }, 201);
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  4. PERIOD HISTORY -> GET /api/rhythm/period/history                 */
// /*  Figma: "Period Tracking History" screen                             */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.getPeriodHistory = async (req, res, next) => {
//   try {
//     // FIX: purana code PeriodLog.find() bina filter ke chala raha tha -
//     // isse har user ko sabke period logs dikh rahe the (privacy bug).
//     // Scoped back to the logged-in user, oldest->newest for cycle-length calc.
//     const history = await PeriodLog.find({ user: req.user._id }).sort({ startDate: 1 });

//     const enriched = history.map((log, index) => {
//       const obj = log.toObject();

//       obj.durationDays = obj.endDate
//         ? Math.round(
//             (new Date(obj.endDate) - new Date(obj.startDate)) / (1000 * 60 * 60 * 24)
//           ) + 1
//         : null;

//       const nextLog = history[index + 1];
//       if (nextLog?.startDate && obj.startDate) {
//         obj.cycleLength = Math.round(
//           (new Date(nextLog.startDate) - new Date(obj.startDate)) / (1000 * 60 * 60 * 24)
//         );
//       } else {
//         obj.cycleLength = req.user.cycleInfo?.averageCycleLength || 28;
//       }

//       obj.cycleLengthLabel = `${obj.cycleLength} day cycle`;
//       return obj;
//     });

//     enriched.reverse(); // latest first for the screen

//     return success(res, "Period history fetched.", {
//       history: enriched,
//       totalCount: enriched.length,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  5. LOG TODAY'S SYMPTOMS -> POST /api/rhythm/symptoms                */
// /*  Figma: "Edit Today's Symptoms" screen                               */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// // exports.logSymptoms = async (req, res, next) => {
// //   try {
// //     const { mood, sleepHours, physicalSymptoms, energy, feelingNote, date } = req.body;
// //     const logDate = startOfDay(date || new Date());

// //     // Model me energy Number (0-100) hai - "Edit Today's Symptoms" screen
// //     // par 0-100% slider hai, Low/Medium/High picker nahi.
// //     if (energy !== undefined && energy !== null && (energy < 0 || energy > 100)) {
// //       return error(res, "Energy must be between 0 and 100.", 422);
// //     }

// //     const symptomLog = await SymptomLog.findOneAndUpdate(
// //       { user: req.user._id, date: logDate },
// //       { mood, sleepHours, physicalSymptoms, energy, feelingNote },
// //       { upsert: true, new: true, setDefaultsOnInsert: true }
// //     );

// //     return success(res, "Symptoms saved successfully.", { symptomLog });
// //   } catch (err) {
// //     next(err);
// //   }
// // };


// exports.logSymptoms = async (req, res, next) => {
//   try {
//     const {
//       mood,
//       sleepHours,
//       physicalSymptoms,
//       energy,
//       feelingNote,
//       date,
//     } = req.body;

//     console.log("========== LOG SYMPTOMS DEBUG ==========");
//     console.log("User ID:", req.user?._id);
//     console.log("Request Body:", req.body);
//     console.log("Energy value:", energy);
//     console.log("Energy type:", typeof energy);
//     console.log("Date:", date);

//     const logDate = startOfDay(date || new Date());

//     console.log("Calculated logDate:", logDate);

//     // Model me energy Number (0-100) hai
//     if (
//       energy !== undefined &&
//       energy !== null &&
//       (energy < 0 || energy > 100)
//     ) {
//       console.log("❌ Energy validation failed");
//       console.log("Energy received:", energy);
//       console.log("Energy type:", typeof energy);

//       return error(res, "Energy must be between 0 and 100.", 422);
//     }

//     console.log("✅ Energy validation passed");
//     console.log("Energy before DB update:", energy);

//     const symptomLog = await SymptomLog.findOneAndUpdate(
//       { user: req.user._id, date: logDate },
//       {
//         mood,
//         sleepHours,
//         physicalSymptoms,
//         energy,
//         feelingNote,
//       },
//       {
//         upsert: true,
//         new: true,
//         setDefaultsOnInsert: true,
//       }
//     );

//     console.log("✅ Symptom log saved successfully");
//     console.log("Saved Symptom Log:", symptomLog);
//     console.log("Saved Energy:", symptomLog.energy);
//     console.log("Saved Energy type:", typeof symptomLog.energy);
//     console.log("========================================");

//     return success(res, "Symptoms saved successfully.", {
//       symptomLog,
//     });
//   } catch (err) {
//     console.error("❌ LOG SYMPTOMS ERROR");
//     console.error("Error message:", err.message);
//     console.error("Error name:", err.name);
//     console.error("Error stack:", err.stack);
//     console.error("Request Body:", req.body);
//     console.error("Energy received:", req.body?.energy);
//     console.error("Energy type:", typeof req.body?.energy);
//     console.error("========================================");

//     next(err);
//   }
// };



// /* ------------------------------------------------------------------ */
// /*  6. SYMPTOM HISTORY -> GET /api/rhythm/symptoms/history              */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.getSymptomHistory = async (req, res, next) => {
//   try {
//     const history = await SymptomLog.find({ user: req.user._id }).sort({ date: -1 }).limit(90);
//     return success(res, "Symptom history fetched.", { history });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  7. GET DROPDOWN OPTIONS -> GET /api/rhythm/symptoms/options         */
// /*  Public                                                              */
// /* ------------------------------------------------------------------ */
// exports.getSymptomOptions = async (req, res, next) => {
//   try {
//     const physicalSymptoms = await PhysicalSymptomOption.find({ isActive: true }).sort({
//       order: 1,
//     });

//     return success(res, "Options fetched.", {
//       moods: ["Happy", "Fun", "Sad", "Shocked", "Angry", "Frustrated"],
//       flowOptions: ["Light", "Medium", "Heavy"],
//       // Model me energy Number(0-100) hai - slider ke liye range bhejo,
//       // fixed options nahi.
//       energyRange: { min: 0, max: 100, step: 1 },
//       physicalSymptoms,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  8. GET TODAY'S SYMPTOMS -> GET /api/rhythm/symptoms/today           */
// /*  Figma: pre-fills "Edit Today's Symptoms" screen                     */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.getTodaySymptoms = async (req, res, next) => {
//   try {
//     const today = startOfDay(new Date());

//     // FIX: pehle ye poore user ke saare logs + debug info bhi bhej raha
//     // tha - dead weight aur ek chhota data-leak. Ab sirf aaj ka log.
//     const symptomLog = await SymptomLog.findOne({
//       user: req.user._id,
//       date: today,
//     });

//     return success(res, "Today's symptoms fetched.", {
//       symptomLog: symptomLog || null,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  9. GET INSIGHTS -> GET /api/rhythm/insights                        */
// /*  Figma: "Insight Summary" screen                                     */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// // exports.getInsights = async (req, res, next) => {
// //   try {
// //     const sevenDaysAgo = startOfDay(new Date());
// //     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

// //     const logs = await SymptomLog.find({
// //       user: req.user._id,
// //       date: { $gte: sevenDaysAgo },
// //     }).sort({ date: 1 });

// //     const moodScoreMap = { Happy: 5, Fun: 4, Shocked: 3, Sad: 2, Frustrated: 2, Angry: 1 };
// //     const moodTrajectory = logs.map((l) => ({
// //       date: l.date,
// //       mood: l.mood,
// //       score: moodScoreMap[l.mood] || 3,
// //     }));

// //     const avgSleep = logs.length
// //       ? logs.reduce((sum, l) => sum + (l.sleepHours || 0), 0) / logs.length
// //       : 0;

// //     // Model me energy Number(0-100) hai - direct average nikaalo, string
// //     // score-map ki zaroorat nahi.
// //     const avgEnergy = logs.length
// //       ? logs.reduce((sum, l) => sum + (typeof l.energy === "number" ? l.energy : 50), 0) /
// //         logs.length
// //       : 50;

// //     const physicalEchoes = {
// //       vitality: Math.round(avgEnergy),
// //       restQuality: Math.round(Math.min((avgSleep / 8) * 100, 100)),
// //       clarity: Math.round((avgEnergy + (avgSleep / 8) * 100) / 2),
// //       hydration: 70,
// //     };

// //     let element = "Earth";
// //     if (avgEnergy < 40) element = "Water";
// //     else if (avgSleep < 5) element = "Fire";
// //     else if (avgEnergy > 75) element = "Air";

// //     const elementalState = await ElementalStateContent.findOne({ element });

// //     return success(res, "Insights fetched.", {
// //       moodTrajectory,
// //       physicalEchoes,
// //       elementalState,
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// exports.getInsights = async (req, res, next) => {
//   try {
//     const sevenDaysAgo = startOfDay(new Date());
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

//     const logs = await SymptomLog.find({
//       user: req.user._id,
//       date: { $gte: sevenDaysAgo },
//     }).sort({ date: 1 });

//     const moodScoreMap = {
//       Happy: 5,
//       Fun: 4,
//       Shocked: 3,
//       Sad: 2,
//       Frustrated: 2,
//       Angry: 1,
//     };

//     const moodTrajectory = logs.map((l) => ({
//       date: l.date,
//       mood: l.mood,
//       score: moodScoreMap[l.mood] || 3,
//     }));

//     const avgSleep = logs.length
//       ? logs.reduce((sum, l) => sum + (l.sleepHours || 0), 0) / logs.length
//       : 0;

//     const avgEnergy = logs.length
//       ? logs.reduce(
//           (sum, l) =>
//             sum + (typeof l.energy === "number" ? l.energy : 50),
//           0
//         ) / logs.length
//       : 50;

//     const physicalEchoes = {
//       vitality: Math.round(avgEnergy),
//       restQuality: Math.round(Math.min((avgSleep / 8) * 100, 100)),
//       clarity: Math.round((avgEnergy + (avgSleep / 8) * 100) / 2),
//       hydration: 70,
//     };

//     let element = "Earth";

//     if (avgEnergy < 40) {
//       element = "Water";
//     } else if (avgSleep < 5) {
//       element = "Fire";
//     } else if (avgEnergy > 75) {
//       element = "Air";
//     }

//     const elementalState = await ElementalStateContent.findOne({ element });

//     // Moon phase calculation
//     const moonPhase = calculateMoonPhase(
//       new Date(),
//       req.user.timezone || "Asia/Kolkata"
//     );

//     // Moon phase content from DB
//     const moonPhaseContent = await MoonPhaseInfo.findOne({
//       phaseName: moonPhase.phaseName,
//     });

//     // Moon cycle category
//     let moonCycle = moonPhase.phaseName;

//     if (
//       ["Waning Gibbous", "Last Quarter", "Waning Crescent"].includes(
//         moonPhase.phaseName
//       )
//     ) {
//       moonCycle = "Waning Moon";
//     } else if (
//       ["Waxing Crescent", "First Quarter", "Waxing Gibbous"].includes(
//         moonPhase.phaseName
//       )
//     ) {
//       moonCycle = "Waxing Moon";
//     }

//     const moonPhaseData = {
//       phaseName: moonPhase.phaseName,
//       moonCycle,
//       keywords: moonPhaseContent?.keywords || [],
//       description: moonPhaseContent?.description || null,
//       image: moonPhaseContent?.image || null,
//     };

//     return success(res, "Insights fetched.", {
//       moodTrajectory,
//       physicalEchoes,
//       elementalState,
//       moonPhase: moonPhaseData,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const PeriodLog = require("../../models/PeriodLog");
const SymptomLog = require("../../models/SymptomLog");
const PhysicalSymptomOption = require("../../models/PhysicalSymptomOption");
const CyclePhaseContent = require("../../models/CyclePhaseContent");
const ElementalStateContent = require("../../models/ElementalStateContent");
const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
const {
  calculateMoonPhase,
  getUpcomingMoonPhases,
  calculateMoonRiseSet,
} = require("../../utils/Astrologyservice");
const { success, error } = require("../../utils/response");

const startOfDay = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0); // UTC use karo
  return date;
};

// FIX: homeController.js ka CYCLE_PHASE_KEY_MAP Figma ke Seasons grid se
// mismatch kar raha tha ("Bloom Phase" -> luteal likha tha, jabki Figma
// Seasons grid saaf batata hai Bloom = Ovulation, Day 14-16). Ye galat
// mapping thi. Rhythm ke liye Figma ke exact season names use kar rahe
// hain - ye ek fixed app-taxonomy constant hai (jaisa season day-ranges
// bhi fixed hain), koi admin content (description/image/tips) yaha
// hardcoded nahi - wo sab CyclePhaseContent DB se hi aata hai.
const PHASE_SEASON_LABEL = {
  menstrual: "Renew",
  follicular: "Rise",
  ovulation: "Bloom",
  luteal: "Reflect",
};

const PHASE_DAY_RANGES = {
  menstrual: { start: 1, end: 5 },
  follicular: { start: 6, end: 13 },
  ovulation: { start: 14, end: 16 },
  luteal: { start: 17, end: null }, // end = totalDays, resolve per-user
};

// dayInCycle se phaseKey + Figma-matching branded phase name nikalta hai.
const getPhaseForDay = (dayInCycle) => {
  const phaseKey =
    dayInCycle <= PHASE_DAY_RANGES.menstrual.end
      ? "menstrual"
      : dayInCycle <= PHASE_DAY_RANGES.follicular.end
      ? "follicular"
      : dayInCycle <= PHASE_DAY_RANGES.ovulation.end
      ? "ovulation"
      : "luteal";
  const phaseName = `${PHASE_SEASON_LABEL[phaseKey]} Phase`; // e.g. "Bloom Phase"
  return { phaseName, phaseKey };
};

/* ------------------------------------------------------------------ */
/*  1. GET RHYTHM DASHBOARD -> GET /api/rhythm                         */
/*  Figma: "Rhythm" main screen (Bloom Phase card, week strip, period   */
/*  tracking, symptoms tracking, seasons grid). Sab kuch DB se aata hai */
/*  - kahin bhi phase description/image/tips hardcoded nahi hai.        */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getRhythmDashboard = async (req, res, next) => {
  try {
    const user = req.user;
    const today = startOfDay(new Date());

    const periodLength = user.cycleInfo?.averagePeriodLength || 5;
    const totalDays = user.cycleInfo?.averageCycleLength || 28;
    let lastPeriodDate = null;
    let dayInCycle = null;
    let phaseName = null;
    let phaseKey = null;

    if (user.cycleInfo && user.cycleInfo.lastPeriodDate) {
      lastPeriodDate = startOfDay(user.cycleInfo.lastPeriodDate);
      const daysSince = Math.floor((Date.now() - lastPeriodDate) / (1000 * 60 * 60 * 24));
      dayInCycle = (daysSince % totalDays) + 1;
      const phase = getPhaseForDay(dayInCycle);
      phaseName = phase.phaseName;
      phaseKey = phase.phaseKey;
    }

    // FIX: Home ke "Bloom Phase" top card me moon icon + moon-phase data bhi
    // dikhta hai - Rhythm ka wahi top card pehle sirf cycle info bhej raha
    // tha, moonPhase field response me tha hi nahi. Ab Home jaisa hi
    // calculateMoonPhase() + MoonPhaseInfo se live moon data bhi bhej rahe hain.
    const timezone = user.timezone || "Asia/Kolkata";
    const moonPhase = calculateMoonPhase(new Date(), timezone);

    const [currentPhaseContent, allPhases, latestPeriod, todaySymptoms, moonPhaseContent] =
      await Promise.all([
        phaseKey ? CyclePhaseContent.findOne({ phaseKey }) : null,
        CyclePhaseContent.find().sort({ phaseKey: 1 }),
        PeriodLog.findOne({ user: user._id }).sort({ startDate: -1 }),
        SymptomLog.findOne({ user: user._id, date: today }),
        MoonPhaseInfo.findOne({ phaseName: moonPhase.phaseName }),
      ]);

    const upcomingPhases = getUpcomingMoonPhases(new Date(), timezone);

    // "Celestial Schedule" card - needs user's geo-coordinates (birthInfo
    // se, jo onboarding ke time geocode hui thi). Agar user ne birth
    // place set nahi kiya, moonrise/moonset null aayenge - lat/long ke
    // bina rise/set calculate nahi ho sakta.
    const celestialSchedule = calculateMoonRiseSet(
      new Date(),
      user.birthInfo?.latitude,
      user.birthInfo?.longitude,
      timezone
    );

    const moonPhaseWithKeywords = {
      ...moonPhase,
      keywords: moonPhaseContent?.keywords || [],
      // "Moon detail" screen ke Description/Weekly Guide quote ke liye -
      // admin-managed content, MoonPhaseInfo se.
      description: moonPhaseContent?.description || null,
      guideContent: moonPhaseContent?.guideContent || null,
      image: moonPhaseContent?.image || null,
      // "The moon does not fight..." jaisa short poetic quote - alag field.
      affirmation: moonPhaseContent?.affirmation || null,
      // "Lunar Cycle Progress" bar (Day X of ~29.5) ke liye.
      lunarCycleProgressPercent: Number(
        ((moonPhase.moonAgeDays / moonPhase.synodicMonthDays) * 100).toFixed(1)
      ),
      // Direct bindable label - "Day 4 of 29.5"
      moonAgeLabel: `Day ${Math.round(moonPhase.moonAgeDays)} of ${Math.round(
        moonPhase.synodicMonthDays
      )}`,
      // "Celestial Schedule" card - moonrise/moonset
      celestialSchedule,
      // "Upcoming Planets" card - next New/First Quarter/Full/Last Quarter dates.
      upcomingPhases,
      // FIX: top wala bada card ab REAL moon phase dikhayega (Waning
      // Gibbous etc, astrology wala) - dayInCycle/totalDays yahin add kar
      // diya taaki card "Waning Gibbous — Day 1 of 28" bana sake, bina
      // cyclePhase object se alag se merge kiye.
      dayInCycle,
      totalDays,
    };

    /* ---------- "Bloom Phase" card - description/image/tips DB se ---------- */
    const cyclePhase = phaseName
      ? {
          dayInCycle,
          totalDays,
          phaseKey,
          phaseName,               // e.g. "Bloom Phase"
          seasonLabel: PHASE_SEASON_LABEL[phaseKey], // e.g. "Bloom"
          description: currentPhaseContent?.description || null,
          image: currentPhaseContent?.image || null,
          tips: currentPhaseContent?.tips || [],
        }
      : null;

    /* ---------- Seasons grid (Renew / Rise / Bloom / Reflect) ---------- */
    // FIX: pehle sirf jitne CyclePhaseContent documents DB me the utne hi
    // seasons aa rahe the (agar 1 doc hai to 1 hi season). Ab hamesha
    // FIXED 4 phases (Renew/Rise/Bloom/Reflect) return honge - DB me jo
    // document mile uska content (title/description/image/tips) merge ho
    // jayega, na mile to null/empty ke sath bhi entry zaroor aayegi.
    const ALL_PHASE_KEYS = ["menstrual", "follicular", "ovulation", "luteal"];
    const seasons = ALL_PHASE_KEYS.map((key) => {
      const phase = allPhases.find((p) => p.phaseKey === key) || null;
      const range = PHASE_DAY_RANGES[key] || {};
      return {
        _id: phase?._id || null,
        phaseKey: key,
        seasonLabel: PHASE_SEASON_LABEL[key], // Renew/Rise/Bloom/Reflect
        title: phase?.title || `${PHASE_SEASON_LABEL[key]} Phase`,
        description: phase?.description || null,
        image: phase?.image || null,
        tips: phase?.tips || [],
        isActive: phase?.isActive ?? false,
        dayRangeStart: range.start,
        dayRangeEnd: range.end === null ? totalDays : range.end,
        isCurrent: key === phaseKey,
      };
    });

    /* ---------- Ovulation + Fertile window + next period ---------- */
    let ovulationDate = null;
    let fertileWindow = null;
    let nextPeriodDate = null;
    let daysUntilNextPeriod = null;

    if (lastPeriodDate) {
      const ovulationDay = new Date(lastPeriodDate);
      ovulationDay.setDate(ovulationDay.getDate() + (totalDays - 14));
      const fertileStart = new Date(ovulationDay);
      fertileStart.setDate(fertileStart.getDate() - 5);
      ovulationDate = ovulationDay;
      fertileWindow = { start: fertileStart, end: ovulationDay };

      const nextPeriod = new Date(lastPeriodDate);
      nextPeriod.setDate(nextPeriod.getDate() + totalDays);
      nextPeriodDate = nextPeriod;
      daysUntilNextPeriod = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
    }

    /* ---------- Week strip (top calendar row, today ke aas-paas) ---------- */
    const weekDays = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);

      let dayPhaseKey = null;
      let isPeriodDay = false;
      let isFertileDay = false;
      let isOvulationDay = false;

      if (lastPeriodDate) {
        const daysSince = Math.floor((d - lastPeriodDate) / (1000 * 60 * 60 * 24));
        const dic = (((daysSince % totalDays) + totalDays) % totalDays) + 1;
        dayPhaseKey = getPhaseForDay(dic).phaseKey;
        isPeriodDay = dic <= periodLength;

        const cyclesElapsed = Math.floor(daysSince / totalDays);
        const thisOvulation = new Date(lastPeriodDate);
        thisOvulation.setDate(
          thisOvulation.getDate() + cyclesElapsed * totalDays + (totalDays - 14)
        );
        const thisFertileStart = new Date(thisOvulation);
        thisFertileStart.setDate(thisFertileStart.getDate() - 5);

        isOvulationDay = d.getTime() === startOfDay(thisOvulation).getTime();
        isFertileDay =
          d.getTime() >= startOfDay(thisFertileStart).getTime() &&
          d.getTime() <= startOfDay(thisOvulation).getTime();
      }

      weekDays.push({
        date: d,
        day: d.getDate(),
        weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
        isToday: d.getTime() === today.getTime(),
        phaseKey: dayPhaseKey,
        isPeriodDay,
        isFertileDay,
        isOvulationDay,
      });
    }

    /* ---------- Period Tracking card ---------- */
    const periodTracking = latestPeriod
      ? {
          id: latestPeriod._id,
          startDate: latestPeriod.startDate,
          endDate: latestPeriod.endDate,
          flow: latestPeriod.flow,
          notes: latestPeriod.notes,
          bleedingDays: latestPeriod.endDate
            ? Math.round(
                (new Date(latestPeriod.endDate) - new Date(latestPeriod.startDate)) /
                  (1000 * 60 * 60 * 24)
              ) + 1
            : periodLength,
          isOnPeriod: dayInCycle !== null && dayInCycle <= periodLength,
          nextPeriodDate,
          daysUntilNextPeriod,
        }
      : null;

    /* ---------- Symptoms Tracking card ---------- */
    const moodEmojiMap = {
      Happy: "😊",
      Fun: "😄",
      Sad: "😢",
      Shocked: "😮",
      Angry: "😠",
      Frustrated: "😣",
    };
    const symptomsTracking = todaySymptoms
      ? {
          mood: todaySymptoms.mood,
          moodEmoji: moodEmojiMap[todaySymptoms.mood] || null,
          sleepHours: todaySymptoms.sleepHours,
          energy: todaySymptoms.energy, // Number 0-100
          physicalSymptoms: todaySymptoms.physicalSymptoms,
          feelingNote: todaySymptoms.feelingNote,
        }
      : null;

    return success(res, "Rhythm dashboard fetched.", {
      today,
      cycleInfo: user.cycleInfo,
      dayInCycle,
      totalDays,
      cyclePhase,
      moonPhase: moonPhaseWithKeywords,
      ovulationDate,
      fertileWindow,
      weekDays,
      periodTracking,
      symptomsTracking,
      seasons,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. GET CALENDAR -> GET /api/rhythm/calendar?month=7&year=2026      */
/*  Figma: "Rhythm - Dates" calendar screen                             */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getCalendar = async (req, res, next) => {
  try {
    const user = req.user;
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const rangeStart = new Date(year, month - 1, 1);
    const rangeEnd = new Date(year, month, 0);
    const daysInMonth = rangeEnd.getDate();

    const periods = await PeriodLog.find({
      user: user._id,
      startDate: { $lte: rangeEnd },
      $or: [{ endDate: { $gte: rangeStart } }, { endDate: null }],
    });

    let dailyPhases = [];
    let ovulationDate = null;
    let fertileWindow = null;

    if (user.cycleInfo && user.cycleInfo.lastPeriodDate) {
      const cycleLen = user.cycleInfo.averageCycleLength || 28;
      const periodLength = user.cycleInfo.averagePeriodLength || 5;
      const lastPeriodDate = startOfDay(user.cycleInfo.lastPeriodDate);

      const ovulationDay = new Date(lastPeriodDate);
      ovulationDay.setDate(ovulationDay.getDate() + (cycleLen - 14));
      const fertileStart = new Date(ovulationDay);
      fertileStart.setDate(fertileStart.getDate() - 5);
      ovulationDate = ovulationDay;
      fertileWindow = { start: fertileStart, end: ovulationDay };

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        const daysSince = Math.floor((date - lastPeriodDate) / (1000 * 60 * 60 * 24));
        const dayInCycle = (((daysSince % cycleLen) + cycleLen) % cycleLen) + 1;
        const phaseKey = getPhaseForDay(dayInCycle).phaseKey;

        const cyclesElapsed = Math.floor(daysSince / cycleLen);
        const thisCycleOvulation = new Date(lastPeriodDate);
        thisCycleOvulation.setDate(
          thisCycleOvulation.getDate() + cyclesElapsed * cycleLen + (cycleLen - 14)
        );
        const thisFertileStart = new Date(thisCycleOvulation);
        thisFertileStart.setDate(thisFertileStart.getDate() - 5);

        dailyPhases.push({
          date,
          phaseKey,
          isPeriodDay: dayInCycle <= periodLength,
          isOvulationDay: date.getTime() === startOfDay(thisCycleOvulation).getTime(),
          isFertileDay:
            date.getTime() >= startOfDay(thisFertileStart).getTime() &&
            date.getTime() <= startOfDay(thisCycleOvulation).getTime(),
        });
      }
    }

    // NAYA: real astronomical moon phase, har din ke liye - cycleInfo pe
    // depend nahi karta, isliye male/non-period users ke "Moon Calendar"
    // screen ke liye bhi yehi field kaam karega (same API, koi naya
    // endpoint nahi banaya).
    // "image" bhi attach kiya - calendar grid ke har din pe moon icon
    // dikhane ke liye (jaisa screenshot me har date ke niche chhota
    // colored moon icon dikh raha hai). Ek hi query me saare 8
    // MoonPhaseInfo docs fetch kar ke phaseName->image map bana liya,
    // taaki 30 alag DB calls na lagein.
    const allMoonPhaseContent = await MoonPhaseInfo.find();
    const moonImageByPhase = {};
    allMoonPhaseContent.forEach((mpc) => {
      moonImageByPhase[mpc.phaseName] = mpc.image || null;
    });

    const moonPhases = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d, 12); // noon, DST-safe
      const mp = calculateMoonPhase(date, user.timezone || "Asia/Kolkata");
      moonPhases.push({
        date: new Date(year, month - 1, d),
        phaseName: mp.phaseName,
        illuminationPercent: mp.illuminationPercent,
        moonAgeDays: mp.moonAgeDays,
        image: moonImageByPhase[mp.phaseName] || null,
      });
    }

    return success(res, "Calendar fetched.", {
      month,
      year,
      periods,
      ovulationDate,
      fertileWindow,
      dailyPhases,
      moonPhases,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. LOG PERIOD -> POST /api/rhythm/period                            */
/*  Figma: "Edit Period Tracking" screen                                */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.logPeriod = async (req, res, next) => {
  try {
    const { startDate, endDate, flow, notes } = req.body;
    if (!startDate) return error(res, "Start date is required.", 422);

    // Schema ke exact enum ke sath match (Light / Medium / Heavy)
    if (flow && !["Light", "Medium", "Heavy"].includes(flow)) {
      return error(res, "Flow must be one of: Light, Medium, Heavy.", 422);
    }

    const periodLog = await PeriodLog.create({
      user: req.user._id,
      startDate,
      endDate,
      flow,
      notes,
    });

    if (!req.user.cycleInfo) req.user.cycleInfo = {};
    req.user.cycleInfo.lastPeriodDate = startDate;
    await req.user.save();

    return success(res, "Period tracking saved.", { periodLog }, 201);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  4. PERIOD HISTORY -> GET /api/rhythm/period/history                 */
/*  Figma: "Period Tracking History" screen                             */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getPeriodHistory = async (req, res, next) => {
  try {
    // FIX: purana code PeriodLog.find() bina filter ke chala raha tha -
    // isse har user ko sabke period logs dikh rahe the (privacy bug).
    // Scoped back to the logged-in user, oldest->newest for cycle-length calc.
    const history = await PeriodLog.find({ user: req.user._id }).sort({ startDate: 1 });

    const enriched = history.map((log, index) => {
      const obj = log.toObject();

      obj.durationDays = obj.endDate
        ? Math.round(
            (new Date(obj.endDate) - new Date(obj.startDate)) / (1000 * 60 * 60 * 24)
          ) + 1
        : null;

      const nextLog = history[index + 1];
      if (nextLog?.startDate && obj.startDate) {
        obj.cycleLength = Math.round(
          (new Date(nextLog.startDate) - new Date(obj.startDate)) / (1000 * 60 * 60 * 24)
        );
      } else {
        obj.cycleLength = req.user.cycleInfo?.averageCycleLength || 28;
      }

      obj.cycleLengthLabel = `${obj.cycleLength} day cycle`;
      return obj;
    });

    enriched.reverse(); // latest first for the screen

    return success(res, "Period history fetched.", {
      history: enriched,
      totalCount: enriched.length,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  5. LOG TODAY'S SYMPTOMS -> POST /api/rhythm/symptoms                */
/*  Figma: "Edit Today's Symptoms" screen                               */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.logSymptoms = async (req, res, next) => {
  try {
    const { mood, sleepHours, physicalSymptoms, energy, feelingNote, date } = req.body;
    const logDate = startOfDay(date || new Date());

    // Model me energy Number (0-100) hai - "Edit Today's Symptoms" screen
    // par 0-100% slider hai, Low/Medium/High picker nahi.
    if (energy !== undefined && energy !== null && (energy < 0 || energy > 100)) {
      return error(res, "Energy must be between 0 and 100.", 422);
    }

    const symptomLog = await SymptomLog.findOneAndUpdate(
      { user: req.user._id, date: logDate },
      { mood, sleepHours, physicalSymptoms, energy, feelingNote },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return success(res, "Symptoms saved successfully.", { symptomLog });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  6. SYMPTOM HISTORY -> GET /api/rhythm/symptoms/history              */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getSymptomHistory = async (req, res, next) => {
  try {
    const history = await SymptomLog.find({ user: req.user._id }).sort({ date: -1 }).limit(90);
    return success(res, "Symptom history fetched.", { history });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  7. GET DROPDOWN OPTIONS -> GET /api/rhythm/symptoms/options         */
/*  Public                                                              */
/* ------------------------------------------------------------------ */
exports.getSymptomOptions = async (req, res, next) => {
  try {
    const physicalSymptoms = await PhysicalSymptomOption.find({ isActive: true }).sort({
      order: 1,
    });

    return success(res, "Options fetched.", {
      moods: ["Happy", "Fun", "Sad", "Shocked", "Angry", "Frustrated"],
      flowOptions: ["Light", "Medium", "Heavy"],
      // Model me energy Number(0-100) hai - slider ke liye range bhejo,
      // fixed options nahi.
      energyRange: { min: 0, max: 100, step: 1 },
      physicalSymptoms,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  8. GET TODAY'S SYMPTOMS -> GET /api/rhythm/symptoms/today           */
/*  Figma: pre-fills "Edit Today's Symptoms" screen                     */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getTodaySymptoms = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());

    // FIX: pehle ye poore user ke saare logs + debug info bhi bhej raha
    // tha - dead weight aur ek chhota data-leak. Ab sirf aaj ka log.
    const symptomLog = await SymptomLog.findOne({
      user: req.user._id,
      date: today,
    });

    return success(res, "Today's symptoms fetched.", {
      symptomLog: symptomLog || null,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  9. GET INSIGHTS -> GET /api/rhythm/insights                        */
/*  Figma: "Insight Summary" screen                                     */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getInsights = async (req, res, next) => {
  try {
    const sevenDaysAgo = startOfDay(new Date());
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const logs = await SymptomLog.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    const moodScoreMap = { Happy: 5, Fun: 4, Shocked: 3, Sad: 2, Frustrated: 2, Angry: 1 };
    const moodTrajectory = logs.map((l) => ({
      date: l.date,
      mood: l.mood,
      score: moodScoreMap[l.mood] || 3,
    }));

    const avgSleep = logs.length
      ? logs.reduce((sum, l) => sum + (l.sleepHours || 0), 0) / logs.length
      : 0;

    // Model me energy Number(0-100) hai - direct average nikaalo, string
    // score-map ki zaroorat nahi.
    const avgEnergy = logs.length
      ? logs.reduce((sum, l) => sum + (typeof l.energy === "number" ? l.energy : 50), 0) /
        logs.length
      : 50;

    const physicalEchoes = {
      vitality: Math.round(avgEnergy),
      restQuality: Math.round(Math.min((avgSleep / 8) * 100, 100)),
      clarity: Math.round((avgEnergy + (avgSleep / 8) * 100) / 2),
      hydration: 70,
    };

    let element = "Earth";
    if (avgEnergy < 40) element = "Water";
    else if (avgSleep < 5) element = "Fire";
    else if (avgEnergy > 75) element = "Air";

    const elementalState = await ElementalStateContent.findOne({ element });

    return success(res, "Insights fetched.", {
      moodTrajectory,
      physicalEchoes,
      elementalState,
    });
  } catch (err) {
    next(err);
  }
};