// const DailyReading = require("../../models/Dailyreading");
// const RitualStep = require("../../models/RitualStep");
// const RitualCompletion = require("../../models/RitualCompletion");
// const TarotDraw = require("../../models/TarotDraw");
// const CyclePhaseContent = require("../../models/CyclePhaseContent");
// const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
// const BreathingSession = require("../../models/BreathingSession");
// const SavedItem = require("../../models/SavedItem");

// const {
//   calculateMoonPhase,
// } = require("../../utils/Astrologyservice");

// const {
//   getCurrentCyclePhase,
// } = require("../../utils/cyclePhaseService");

// const { success } = require("../../utils/response");

// const startOfToday = () => {
//   const d = new Date();
//   d.setHours(0, 0, 0, 0);
//   return d;
// };

// /* ------------------------------------------------------------------ */
// /* GET HOME DASHBOARD -> GET /api/home                                */
// /* ------------------------------------------------------------------ */

// exports.getHome = async (req, res, next) => {
//   try {
//     const user = req.user;
//     const today = startOfToday();

//     // ---------------------------------------------------------------
//     // Today's Moon Phase
//     // ---------------------------------------------------------------
//     const moonPhase = calculateMoonPhase(
//       new Date(),
//       user.timezone || "Asia/Kolkata"
//     );

//     // ---------------------------------------------------------------
//     // Current Cycle Phase
//     // ---------------------------------------------------------------
//     const cycle = getCurrentCyclePhase(user);

//     const cyclePhaseName = cycle?.phaseName || null;
//     const dayInCycle = cycle?.dayInCycle || null;
//     const totalDays = cycle?.totalDays || null;

//     // ---------------------------------------------------------------
//     // Today's date range
//     // ---------------------------------------------------------------
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     // ---------------------------------------------------------------
//     // Fetch all Home data
//     // ---------------------------------------------------------------
//     const [
//       dailyReading,
//       totalRitualSteps,
//       ritualCompletion,
//       tarotDraw,
//       cyclePhaseContent,
//       moonPhaseContent,
//       breathingSession,
//     ] = await Promise.all([
//       DailyReading.findOne({
//         date: {
//           $gte: todayStart,
//           $lt: todayEnd,
//         },
//         isActive: true,
//       }),

//       RitualStep.countDocuments({
//         isActive: true,
//       }),

//       RitualCompletion.findOne({
//         user: user._id,
//         date: today,
//       }),

//       TarotDraw.findOne({
//         user: user._id,
//         date: today,
//       }).populate("card"),

//       cycle
//         ? CyclePhaseContent.findOne({
//             phaseKey: cycle.phaseKey,
//           })
//         : null,

//       MoonPhaseInfo.findOne({
//         phaseName: moonPhase.phaseName,
//       }),

//       BreathingSession.findOne({
//         isActive: true,
//       }),
//     ]);

//     // ---------------------------------------------------------------
//     // Check if today's Daily Reading is bookmarked (SavedItem)
//     // ---------------------------------------------------------------
//     let isDailyReadingSaved = false;

//     if (dailyReading) {
//       const savedItem = await SavedItem.findOne({
//         user: user._id,
//         type: "reading",
//         dailyReading: dailyReading._id,
//         isArchived: false,
//       }).select("_id");

//       isDailyReadingSaved = !!savedItem;
//     }

//     // ---------------------------------------------------------------
//     // Cycle Phase
//     // ---------------------------------------------------------------
//     const cyclePhase = cyclePhaseName
//       ? {
//           dayInCycle,
//           totalDays,
//           phaseName: cyclePhaseName,
//           description: cyclePhaseContent?.description || null,
//         }
//       : null;

//     // ---------------------------------------------------------------
//     // Moon Phase
//     // ---------------------------------------------------------------
//     const moonPhaseWithKeywords = {
//       ...moonPhase,
//       keywords: moonPhaseContent?.keywords || [],
//     };

//     // ---------------------------------------------------------------
//     // Ritual
//     // ---------------------------------------------------------------
//     const completedCount = ritualCompletion
//       ? ritualCompletion.completedSteps.length
//       : 0;

//     const isFullyCompleted = ritualCompletion
//       ? ritualCompletion.isFullyCompleted
//       : false;

//     const ritual = {
//       completedCount,
//       totalSteps: totalRitualSteps,
//       isFullyCompleted,

//       ctaText: isFullyCompleted
//         ? "View Ritual"
//         : completedCount > 0
//           ? "Continue Ritual"
//           : "Begin Ritual",
//     };

//     // ---------------------------------------------------------------
//     // Cosmic Inhale
//     // ---------------------------------------------------------------
//     const cosmicInhale = breathingSession
//       ? {
//           id: breathingSession._id,
//           title: breathingSession.title,
//           subtitle: breathingSession.subtitle,
//           icon: breathingSession.icon,

//           inhaleSeconds: breathingSession.inhaleSeconds,
//           holdSeconds: breathingSession.holdSeconds,
//           exhaleSeconds: breathingSession.exhaleSeconds,
//           totalCycles: breathingSession.totalCycles,

//           audioType: breathingSession.audioType,
//           cyclePhaseKey: breathingSession.cyclePhaseKey,

//           benefits: breathingSession.benefits || [],

//           isActive: breathingSession.isActive,
//           createdAt: breathingSession.createdAt,
//           updatedAt: breathingSession.updatedAt,

//           ctaText: "Start Breathing",
//         }
//       : null;

//     // ---------------------------------------------------------------
//     // DAILY READING + isSaved
//     // ---------------------------------------------------------------
//     const dailyReadingData = dailyReading
//       ? {
//           id: dailyReading._id,
//           date: dailyReading.date,
//           moonPhase: dailyReading.moonPhase,
//           heroImage: dailyReading.heroImage,
//           title: dailyReading.title,
//           summary: dailyReading.summary,
//           content: dailyReading.content,
//           readTimeMinutes: dailyReading.readTimeMinutes,
//           cycleAstralSynergy: dailyReading.cycleAstralSynergy,
//           cosmicSelfCheck: dailyReading.cosmicSelfCheck,
//           moonPhaseGuidance: dailyReading.moonPhaseGuidance,
//           creativeRitual: dailyReading.creativeRitual,
//           eveningReflectionPrompt: dailyReading.eveningReflectionPrompt,
//           estimatedCompletion: dailyReading.estimatedCompletion,
//           isActive: dailyReading.isActive,
//           createdAt: dailyReading.createdAt,
//           updatedAt: dailyReading.updatedAt,
//           isSaved: isDailyReadingSaved,
//         }
//       : null;

//     // ---------------------------------------------------------------
//     // Response
//     // ---------------------------------------------------------------
//     return success(res, "Home data fetched.", {
//       greetingName:
//         user.personalization?.preferredName || user.name,

//       date: new Date(),

//       cyclePhase,

//       moonPhase: moonPhaseWithKeywords,

//       dailyReading: dailyReadingData,

//       ritual,

//       cosmicInhale,

//       tarotCardOfDay: tarotDraw
//         ? {
//             id: tarotDraw.card._id,
//             name: tarotDraw.card.name,
//             image: tarotDraw.card.image,
//             description: tarotDraw.card.description,
//           }
//         : null,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const DailyReading = require("../../models/Dailyreading");
const WeeklyReading = require("../../models/WeeklyReading");
const RitualStep = require("../../models/RitualStep");
const RitualCompletion = require("../../models/RitualCompletion");
const TarotDraw = require("../../models/TarotDraw");
const CyclePhaseContent = require("../../models/CyclePhaseContent");
const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
const BreathingSession = require("../../models/BreathingSession");
const SavedItem = require("../../models/SavedItem");

const {
  calculateMoonPhase,
} = require("../../utils/Astrologyservice");

const {
  getCurrentCyclePhase,
} = require("../../utils/cyclePhaseService");

const { success } = require("../../utils/response");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ------------------------------------------------------------------ */
/* GET HOME DASHBOARD -> GET /api/home                                */
/* ------------------------------------------------------------------ */

exports.getHome = async (req, res, next) => {
  try {
    const user = req.user;
    const today = startOfToday();

    // ---------------------------------------------------------------
    // Today's Moon Phase
    // ---------------------------------------------------------------
    const moonPhase = calculateMoonPhase(
      new Date(),
      user.timezone || "Asia/Kolkata"
    );

    // ---------------------------------------------------------------
    // Current Cycle Phase
    // ---------------------------------------------------------------
    const cycle = getCurrentCyclePhase(user);

    const cyclePhaseName = cycle?.phaseName || null;
    const dayInCycle = cycle?.dayInCycle || null;
    const totalDays = cycle?.totalDays || null;

    // ---------------------------------------------------------------
    // Today's date range
    // ---------------------------------------------------------------
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // ---------------------------------------------------------------
    // Fetch all Home data
    // ---------------------------------------------------------------
    const [
      dailyReading,
      weeklyReading,
      totalRitualSteps,
      ritualCompletion,
      tarotDraw,
      cyclePhaseContent,
      moonPhaseContent,
      breathingSession,
    ] = await Promise.all([
      DailyReading.findOne({
        date: {
          $gte: todayStart,
          $lt: todayEnd,
        },
        isActive: true,
      }),

      WeeklyReading.findOne({ isActive: true }).sort({ weekStartDate: -1 }),

      RitualStep.countDocuments({
        isActive: true,
      }),

      RitualCompletion.findOne({
        user: user._id,
        date: today,
      }),

      TarotDraw.findOne({
        user: user._id,
        date: today,
      }).populate("card"),

      cycle
        ? CyclePhaseContent.findOne({
          phaseKey: cycle.phaseKey,
        })
        : null,

      MoonPhaseInfo.findOne({
        phaseName: moonPhase.phaseName,
      }),

      BreathingSession.findOne({
        isActive: true,
      }),
    ]);

    // ---------------------------------------------------------------
    // Check if today's Daily Reading is bookmarked (SavedItem)
    // ---------------------------------------------------------------
    let isDailyReadingSaved = false;

    if (dailyReading) {
      const savedItem = await SavedItem.findOne({
        user: user._id,
        type: "reading",
        dailyReading: dailyReading._id,
        isArchived: false,
      }).select("_id");

      isDailyReadingSaved = !!savedItem;
    }

    // ---------------------------------------------------------------
    // Check if the current Weekly Reading is bookmarked (SavedItem)
    // NOTE: assumes SavedItem has a "weeklyReading" ref field and a
    // "weeklyReading" type value, mirroring the daily reading pattern
    // above. Adjust the type string / field name if your SavedItem
    // schema names them differently.
    // ---------------------------------------------------------------
    let isWeeklyReadingSaved = false;

    if (weeklyReading) {
      const savedWeeklyItem = await SavedItem.findOne({
        user: user._id,
        type: "reading",
        weeklyReading: weeklyReading._id,
        isArchived: false,
      }).select("_id");

      isWeeklyReadingSaved = !!savedWeeklyItem;
    }

    // ---------------------------------------------------------------
    // Cycle Phase
    // ---------------------------------------------------------------
    const cyclePhase = cyclePhaseName
      ? {
        dayInCycle,
        totalDays,
        phaseName: cyclePhaseName,
        description: cyclePhaseContent?.description || null,
      }
      : null;

    // ---------------------------------------------------------------
    // Moon Phase
    // ---------------------------------------------------------------
    const moonPhaseWithKeywords = {
      ...moonPhase,
      keywords: moonPhaseContent?.keywords || [],
    };

    // ---------------------------------------------------------------
    // Ritual
    // ---------------------------------------------------------------
    const completedCount = ritualCompletion
      ? ritualCompletion.completedSteps.length
      : 0;

    const isFullyCompleted = ritualCompletion
      ? ritualCompletion.isFullyCompleted
      : false;

    const ritual = {
      completedCount,
      totalSteps: totalRitualSteps,
      isFullyCompleted,

      ctaText: isFullyCompleted
        ? "View Ritual"
        : completedCount > 0
          ? "Continue Ritual"
          : "Begin Ritual",
    };

    // ---------------------------------------------------------------
    // Cosmic Inhale
    // ---------------------------------------------------------------
    const cosmicInhale = breathingSession
      ? {
        id: breathingSession._id,
        title: breathingSession.title,
        subtitle: breathingSession.subtitle,
        icon: breathingSession.icon,

        inhaleSeconds: breathingSession.inhaleSeconds,
        holdSeconds: breathingSession.holdSeconds,
        exhaleSeconds: breathingSession.exhaleSeconds,
        totalCycles: breathingSession.totalCycles,

        audioType: breathingSession.audioType,
        cyclePhaseKey: breathingSession.cyclePhaseKey,

        benefits: breathingSession.benefits || [],

        isActive: breathingSession.isActive,
        createdAt: breathingSession.createdAt,
        updatedAt: breathingSession.updatedAt,

        ctaText: "Start Breathing",
      }
      : null;

    // ---------------------------------------------------------------
    // DAILY READING + isSaved
    // NOTE: cosmicSelfCheck removed from this response - the "Cosmic
    // Self Check" section was removed from the admin form, so this
    // field is no longer populated and there's no point sending it.
    // creativeRitual is kept because "Button Text" is still set from
    // the admin form (title/description will just come through empty
    // since those fields were removed from the form too).
    // ---------------------------------------------------------------
    const dailyReadingData = dailyReading
      ? {
        id: dailyReading._id,
        date: dailyReading.date,
        moonPhase: dailyReading.moonPhase,
        heroImage: dailyReading.heroImage,
        title: dailyReading.title,
        summary: dailyReading.summary,
        content: dailyReading.content,
        readTimeMinutes: dailyReading.readTimeMinutes,
        cycleAstralSynergy: dailyReading.cycleAstralSynergy,
        moonPhaseGuidance: dailyReading.moonPhaseGuidance,
        creativeRitual: dailyReading.creativeRitual,
        eveningReflectionPrompt: dailyReading.eveningReflectionPrompt,
        estimatedCompletion: dailyReading.estimatedCompletion,
        isActive: dailyReading.isActive,
        createdAt: dailyReading.createdAt,
        updatedAt: dailyReading.updatedAt,
        isSaved: isDailyReadingSaved,
      }
      : null;

    // ---------------------------------------------------------------
    // WEEKLY READING + isSaved
    // ---------------------------------------------------------------
    const weeklyReadingData = weeklyReading
      ? {
        id: weeklyReading._id,
        weekStartDate: weeklyReading.weekStartDate,
        weekEndDate: weeklyReading.weekEndDate,
        title: weeklyReading.title,
        summary: weeklyReading.summary,
        content: weeklyReading.content,
        heroImage: weeklyReading.heroImage,
        focusArea: weeklyReading.focusArea,
        affirmation: weeklyReading.affirmation,
        readTimeMinutes: weeklyReading.readTimeMinutes,
        cycleAstralSynergy: weeklyReading.cycleAstralSynergy,
        moonPhaseGuidance: weeklyReading.moonPhaseGuidance,
        eveningReflectionPrompt: weeklyReading.eveningReflectionPrompt,
        isActive: weeklyReading.isActive,
        createdAt: weeklyReading.createdAt,
        updatedAt: weeklyReading.updatedAt,
        isSaved: isWeeklyReadingSaved,
      }
      : null;

    // ---------------------------------------------------------------
    // Response
    // ---------------------------------------------------------------
    return success(res, "Home data fetched.", {
      greetingName:
        user.personalization?.preferredName || user.name,

      date: new Date(),

      cyclePhase,

      moonPhase: moonPhaseWithKeywords,

      dailyReading: dailyReadingData,

      weeklyReading: weeklyReadingData,

      ritual,

      cosmicInhale,

      tarotCardOfDay: tarotDraw
        ? {
          id: tarotDraw.card._id,
          name: tarotDraw.card.name,
          image: tarotDraw.card.image,
          description: tarotDraw.card.description,
        }
        : null,
    });
  } catch (err) {
    next(err);
  }
};