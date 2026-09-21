// const User = require("../../models/User");
// const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
// const UpcomingMoonEvent = require("../../models/UpcomingMoonEvent");
// const Planet = require("../../models/Planet");
// const ZodiacSignContent = require("../../models/ZodiacSignContent");
// const BirthChartPersonalityContent = require("../../models/BirthChartPersonalityContent");
// const PoweredByContent = require("../../models/PoweredByContent");
// const DailyReading = require("../../models/Dailyreading");
// const WeeklyReading = require("../../models/WeeklyReading");
// const { success, error } = require("../../utils/response");
// const {
//   calculateCurrentTransits,
//   calculateMoonPhase,
//   calculateBirthChart,
// } = require("../../utils/Astrologyservice");
// const { geocodePlace } = require("../../utils/geocode");
// const moment = require("moment-timezone");

// /* ------------------------------------------------------------------ */
// /*  1. GET CELESTIAL OVERVIEW -> GET /api/celestial                    */
// /*  Figma: "Celestial" main screen                                      */
// /*  Moon phase + planetary positions REAL-TIME (Swiss Ephemeris).       */
// /*  Everything descriptive/editorial is admin-managed from the DB —     */
// /*  nothing is hardcoded in this file.                                  */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.getCelestialOverview = async (req, res, next) => {
//   try {
//     const user = req.user;

//     const moonPhase = calculateMoonPhase();
//     const transits = calculateCurrentTransits();

//     const hasBirthChart = !!(user.birthChart && user.birthChart.calculatedAt);

//     // Short teaser paragraph shown under "Birth Chart Summary" card.
//     // There's no stored personality text on birthChart, so we build a
//     // sentence from the live-calculated sunSign / moonSign / ascendant.
//     let birthChartSummary = null;
//     if (hasBirthChart) {
//       const { sunSign, moonSign, ascendant } = user.birthChart;
//       if (sunSign && moonSign) {
//         birthChartSummary = `With your Sun in ${sunSign}, Moon in ${moonSign}${
//           ascendant?.sign ? `, and ${ascendant.sign} rising` : ""
//         }, your chart reveals a naturally intuitive personality — one shaped by inward emotional depth, resilience, and meaningful connection.`;
//       }
//     }

//     // "Rising Sign" card -> icon + sign name + admin-managed description
//     const risingSignName = user.birthChart?.ascendant?.sign || null;
//     const risingSignContent = risingSignName
//       ? await ZodiacSignContent.findOne({ signName: risingSignName })
//       : null;

//     const risingSign = risingSignName
//       ? {
//           sign: risingSignName,
//           icon: risingSignContent?.icon || "",
//           description: risingSignContent?.description || null,
//         }
//       : null;

//     const signSummary = {
//       sunSign: user.birthChart?.sunSign || null,
//       moonSign: user.birthChart?.moonSign || null,
//       risingSign: risingSignName,
//     };

//     // "Daily Reading" teaser -> MUST be TODAY'S reading (by date)
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     const [dailyReading, weeklyReading, moonContent, poweredBy] = await Promise.all([
//       DailyReading.findOne({
//         date: { $gte: todayStart, $lt: todayEnd },
//         isActive: true,
//       }),
//       WeeklyReading.findOne({ isActive: true }).sort({ weekStartDate: -1 }),
//       // "Today's Moon" card content -> keywords + description come from
//       // MoonPhaseInfo in the DB (admin-managed), not a hardcoded map.
//       MoonPhaseInfo.findOne({ phaseName: moonPhase.phaseName }),
//       // "Powered By" footer -> admin-managed list, not a hardcoded array.
//       PoweredByContent.find({ isActive: true }).sort({ order: 1 }),
//     ]);

//     const todaysMoon = {
//       phaseName: moonPhase.phaseName,
//       keywords: moonContent?.keywords || [],
//       description: moonContent?.description || null,
//     };

//     return success(res, "Celestial overview fetched.", {
//       date: new Date(),
//       moonPhase,
//       todaysMoon,
//       planetaryPositions: transits,
//       birthChartAvailable: hasBirthChart,
//       birthChartSummary,
//       risingSign,
//       signSummary,
//       dailyReading: dailyReading
//         ? {
//             id: dailyReading._id,
//             title: dailyReading.title,
//             summary: dailyReading.summary,
//             heroImage: dailyReading.heroImage,
//           }
//         : null,
//       weeklyReading: weeklyReading
//         ? {
//             id: weeklyReading._id,
//             title: weeklyReading.title,
//             summary: weeklyReading.summary,
//             heroImage: weeklyReading.heroImage,
//           }
//         : null,
//       poweredBy: poweredBy.map((p) => ({
//         title: p.title,
//         description: p.description,
//         icon: p.icon,
//       })),
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  2. GET BIRTH CHART -> GET /api/celestial/birth-chart                */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.getBirthChart = async (req, res, next) => {
//   try {
//     const user = req.user;

//     if (!user.birthInfo || !user.birthInfo.dateOfBirth) {
//       return error(res, "Please complete your birth information first.", 400);
//     }

//     if (!user.birthChart || !user.birthChart.calculatedAt) {
//       const chart = calculateBirthChart({
//         dateOfBirth: user.birthInfo.dateOfBirth,
//         birthTime: user.birthInfo.birthTime,
//         isExactTime: user.birthInfo.isExactTime,
//         latitude: user.birthInfo.latitude,
//         longitude: user.birthInfo.longitude,
//         timezone: user.birthInfo.timezone,
//       });
//       user.birthChart = chart;
//       await user.save();
//     }

//     const personalityContent = user.birthChart.sunSign
//       ? await BirthChartPersonalityContent.findOne({
//           sunSign: user.birthChart.sunSign,
//         })
//       : null;

//     const risingSignName = user.birthChart.ascendant?.sign || null;
//     const risingSignContent = risingSignName
//       ? await ZodiacSignContent.findOne({ signName: risingSignName })
//       : null;

//     return success(res, "Birth chart fetched.", {
//       birthInfo: user.birthInfo,
//       birthChart: user.birthChart,
//       personalitySummary: personalityContent?.personalitySummary || null,
//       traits: personalityContent?.traits || [],
//       risingSign: risingSignName
//         ? {
//             sign: risingSignName,
//             icon: risingSignContent?.icon || "",
//             description: risingSignContent?.description || null,
//           }
//         : null,
//       signSummary: {
//         sunSign: user.birthChart.sunSign || null,
//         moonSign: user.birthChart.moonSign || null,
//         risingSign: risingSignName,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  3. RECALCULATE BIRTH CHART -> POST /api/celestial/recalculate-chart */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.recalculateBirthChart = async (req, res, next) => {
//   try {
//     const user = req.user;

//     if (!user.birthInfo || !user.birthInfo.dateOfBirth) {
//       return error(res, "Please complete your birth information first.", 400);
//     }

//     if (user.birthInfo.birthPlace && !user.birthInfo.latitude) {
//       const geo = await geocodePlace(user.birthInfo.birthPlace);
//       user.birthInfo.latitude = geo.latitude;
//       user.birthInfo.longitude = geo.longitude;
//       user.birthInfo.timezone = geo.timezone;
//     }

//     const chart = calculateBirthChart({
//       dateOfBirth: user.birthInfo.dateOfBirth,
//       birthTime: user.birthInfo.birthTime,
//       isExactTime: user.birthInfo.isExactTime,
//       latitude: user.birthInfo.latitude,
//       longitude: user.birthInfo.longitude,
//       timezone: user.birthInfo.timezone,
//     });
//     user.birthChart = chart;
//     await user.save();

//     return success(res, "Birth chart recalculated.", { birthChart: user.birthChart });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /*  4. GET MOON PHASE DETAIL -> GET /api/celestial/moon-phase           */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.getMoonPhaseDetail = async (req, res, next) => {
//   try {
//     const moonPhase = calculateMoonPhase();

//     // ---------- Illumination (live calculated) ----------
//     const illuminationPercent =
//       moonPhase.illuminationPercent != null
//         ? Number(moonPhase.illuminationPercent).toFixed(1)
//         : null;

//     // ---------- Lunar Cycle Progress (derived from live elongation) ----------
//     const SYNODIC_MONTH_DAYS = 29.53;
//     const dayInCycle = moonPhase.elongation
//       ? Math.round((moonPhase.elongation / 360) * SYNODIC_MONTH_DAYS * 10) / 10
//       : null;

//     const lunarCycle = {
//       dayInCycle,
//       totalDays: SYNODIC_MONTH_DAYS,
//       progressPercent: moonPhase.elongation
//         ? Math.round((moonPhase.elongation / 360) * 100)
//         : null,
//       label: dayInCycle
//         ? `Day ${String(Math.floor(dayInCycle)).padStart(2, "0")} of ~${SYNODIC_MONTH_DAYS}`
//         : null,
//     };

//     // ---------- Current Sign Date ----------
//     const currentDate = moonPhase.calculatedAt || new Date();
//     const formattedSignDate = moment(currentDate)
//       .tz(moonPhase.timezone || "UTC")
//       .format("MM/DD/YY");

//     // ---------- Admin Content (fully DB-driven) ----------
//     const guideContent = await MoonPhaseInfo.findOne({
//       phaseName: moonPhase.phaseName,
//     });

//     const upcomingEvents = await UpcomingMoonEvent.find({
//       date: { $gte: new Date() },
//     })
//       .sort({ date: 1 })
//       .limit(5);

//     return success(res, "Moon phase detail fetched.", {
//       phaseName: moonPhase.phaseName,
//       keywords: guideContent?.keywords || [],

//       illumination: illuminationPercent,
//       illuminationLabel: illuminationPercent ? `${illuminationPercent}%` : null,

//       currentPhase: {
//         name: moonPhase.phaseName,
//         illumination: illuminationPercent,
//         illuminationLabel: illuminationPercent ? `${illuminationPercent}%` : null,
//       },

//       currentSign: {
//         name: moonPhase.currentSign || null,
//         date: formattedSignDate,
//       },

//       illuminationCard: {
//         value: illuminationPercent,
//         label: illuminationPercent ? `${illuminationPercent}%` : null,
//         progressPercent: illuminationPercent
//           ? Math.round(Number(illuminationPercent))
//           : null,
//       },

//       lunarCycle,

//       // FIX: schema field is "phaseName" / "subtitle" / "time" — there is
//       // no "name" field on UpcomingMoonEvent.
//       upcomingPhases: upcomingEvents.map((event) => ({
//         id: event._id,
//         phaseName: event.phaseName,
//         subtitle: event.subtitle,
//         time: event.time,
//         date: event.date,
//         formattedDate: formatUpcomingDate(event.date),
//       })),

//       guide: {
//         // Fully DB-driven — no hardcoded fallback text. Seed empty
//         // skeleton entries via seedMoonPhaseInfo.js, then the admin fills
//         // in real content from /admin/content/moon-phases.
//         description: guideContent?.description || null,
//         fullGuideContent: guideContent?.guideContent || null,
//         buttonText: "View full Moon Guide",
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// function formatUpcomingDate(date) {
//   if (!date) return null;
//   return new Date(date).toLocaleDateString("en-US", {
//     month: "long",
//     day: "numeric",
//   });
// }

// /* ------------------------------------------------------------------ */
// /*  5. GET PLANET DETAIL -> GET /api/celestial/planets/:name            */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.getPlanetDetail = async (req, res, next) => {
//   try {
//     const planetContent = await Planet.findOne({
//       name: new RegExp(`^${req.params.name}$`, "i"),
//     });

//     if (!planetContent) {
//       return error(res, "Planet not found.", 404);
//     }

//     const user = req.user;
//     const userPlacement =
//       user.birthChart?.planets?.find(
//         (p) => p.name.toLowerCase() === req.params.name.toLowerCase()
//       ) || null;

//     return success(res, "Planet detail fetched.", {
//       planet: planetContent,
//       yourPlacement: userPlacement
//         ? {
//             sign: userPlacement.sign,
//             degreeFormatted: userPlacement.degreeFormatted,
//             label: `${userPlacement.degreeFormatted} ${userPlacement.sign}`,
//           }
//         : null,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const User = require("../../models/User");
const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
const Planet = require("../../models/Planet");
const ZodiacSignContent = require("../../models/ZodiacSignContent");
const BirthChartPersonalityContent = require("../../models/BirthChartPersonalityContent");
const PoweredByContent = require("../../models/PoweredByContent");
const DailyReading = require("../../models/Dailyreading");
const WeeklyReading = require("../../models/WeeklyReading");
const { success, error } = require("../../utils/response");
const SavedItem = require("../../models/SavedItem");
const {
  calculateCurrentTransits,
  calculateMoonPhase,
  calculateBirthChart,
  getUpcomingMoonPhases,
  calculateMoonRiseSet,
} = require("../../utils/Astrologyservice");
const { geocodePlace } = require("../../utils/geocode");
const moment = require("moment-timezone");


/* ------------------------------------------------------------------ */
// exports.getCelestialOverview = async (req, res, next) => {
//   try {
//     const user = req.user;

//     // FIX: user.timezone pass nahi ho raha tha, default UTC use ho raha
//     // tha - isse "today's" moon phase kabhi-kabhi user ke local date se
//     // ek din aage/peeche mismatch kar sakta tha.
//     const timezone = user.timezone || "Asia/Kolkata";
//     const moonPhase = calculateMoonPhase(new Date(), timezone);
//     const transits = calculateCurrentTransits();

//     // NAYA: "Planetary Position" cards me icon chahiye (Sun/Moon/Mercury
//     // etc ke symbols) - transits sirf astronomy data deta hai, icon
//     // admin-managed Planet collection se aata hai. Ek hi query me sab
//     // planets fetch kar ke name se map bana liya.
//     const allPlanets = await Planet.find();
//     const planetIconByName = {};
//     allPlanets.forEach((p) => {
//       planetIconByName[p.name.toLowerCase()] = p.icon || "";
//     });

//     const planetaryPositions = transits.map((t) => ({
//       ...t,
//       icon: planetIconByName[t.name.toLowerCase()] || "",
//     }));

//     const hasBirthChart = !!(user.birthChart && user.birthChart.calculatedAt);

//     // Short teaser paragraph shown under "Birth Chart Summary" card.
//     // There's no stored personality text on birthChart, so we build a
//     // sentence from the live-calculated sunSign / moonSign / ascendant.
//     let birthChartSummary = null;
//     if (hasBirthChart) {
//       const { sunSign, moonSign, ascendant } = user.birthChart;
//       if (sunSign && moonSign) {
//         birthChartSummary = `With your Sun in ${sunSign}, Moon in ${moonSign}${
//           ascendant?.sign ? `, and ${ascendant.sign} rising` : ""
//         }, your chart reveals a naturally intuitive personality — one shaped by inward emotional depth, resilience, and meaningful connection.`;
//       }
//     }

//     // "Rising Sign" card -> icon + sign name + admin-managed description
//     const risingSignName = user.birthChart?.ascendant?.sign || null;
//     const risingSignContent = risingSignName
//       ? await ZodiacSignContent.findOne({ signName: risingSignName })
//       : null;

//     const risingSign = risingSignName
//       ? {
//           sign: risingSignName,
//           icon: risingSignContent?.icon || "",
//           description: risingSignContent?.description || null,
//         }
//       : null;

//     const signSummary = {
//       sunSign: user.birthChart?.sunSign || null,
//       moonSign: user.birthChart?.moonSign || null,
//       risingSign: risingSignName,
//     };

//     // "Daily Reading" teaser -> MUST be TODAY'S reading (by date)
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     const [dailyReading, weeklyReading, moonContent, poweredBy] = await Promise.all([
//       DailyReading.findOne({
//         date: { $gte: todayStart, $lt: todayEnd },
//         isActive: true,
//       }),
//       WeeklyReading.findOne({ isActive: true }).sort({ weekStartDate: -1 }),
//       // "Today's Moon" card content -> keywords + description come from
//       // MoonPhaseInfo in the DB (admin-managed), not a hardcoded map.
//       MoonPhaseInfo.findOne({ phaseName: moonPhase.phaseName }),
//       // "Powered By" footer -> admin-managed list, not a hardcoded array.
//       PoweredByContent.find({ isActive: true }).sort({ order: 1 }),
//     ]);

//     const todaysMoon = {
//       phaseName: moonPhase.phaseName,
//       // FIX: Celestial main screen's moon card shows illumination % and
//       // moon age ("8%", "4.2 Days") - these were missing before.
//       illuminationPercent: moonPhase.illuminationPercent,
//       moonAgeDays: moonPhase.moonAgeDays,
//       keywords: moonContent?.keywords || [],
//       description: moonContent?.description || null,
//       image: moonContent?.image || null,
//     };

//     return success(res, "Celestial overview fetched.", {
//       date: new Date(),
//       moonPhase,
//       todaysMoon,
//       planetaryPositions,
//       birthChartAvailable: hasBirthChart,
//       birthChartSummary,
//       risingSign,
//       signSummary,
//       dailyReading: dailyReading
//         ? {
//             id: dailyReading._id,
//             title: dailyReading.title,
//             summary: dailyReading.summary,
//             heroImage: dailyReading.heroImage,
//           }
//         : null,
//       weeklyReading: weeklyReading
//         ? {
//             id: weeklyReading._id,
//             title: weeklyReading.title,
//             summary: weeklyReading.summary,
//             heroImage: weeklyReading.heroImage,
//           }
//         : null,
//       poweredBy: poweredBy.map((p) => ({
//         title: p.title,
//         description: p.description,
//         icon: p.icon,
//       })),
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getCelestialOverview = async (req, res, next) => {
  try {
    const user = req.user;

    // FIX: user.timezone pass nahi ho raha tha, default UTC use ho raha
    // tha - isse "today's" moon phase kabhi-kabhi user ke local date se
    // ek din aage/peeche mismatch kar sakta tha.
    const timezone = user.timezone || "Asia/Kolkata";
    const moonPhase = calculateMoonPhase(new Date(), timezone);
    const transits = calculateCurrentTransits();

    // NAYA: "Planetary Position" cards me icon chahiye (Sun/Moon/Mercury
    // etc ke symbols) - transits sirf astronomy data deta hai, icon
    // admin-managed Planet collection se aata hai. Ek hi query me sab
    // planets fetch kar ke name se map bana liya.
    const allPlanets = await Planet.find();
    const planetIconByName = {};
    allPlanets.forEach((p) => {
      planetIconByName[p.name.toLowerCase()] = p.icon || "";
    });

    const planetaryPositions = transits.map((t) => ({
      ...t,
      icon: planetIconByName[t.name.toLowerCase()] || "",
    }));

    const hasBirthChart = !!(user.birthChart && user.birthChart.calculatedAt);

    // Short teaser paragraph shown under "Birth Chart Summary" card.
    // There's no stored personality text on birthChart, so we build a
    // sentence from the live-calculated sunSign / moonSign / ascendant.
    let birthChartSummary = null;
    if (hasBirthChart) {
      const { sunSign, moonSign, ascendant } = user.birthChart;
      if (sunSign && moonSign) {
        birthChartSummary = `With your Sun in ${sunSign}, Moon in ${moonSign}${ascendant?.sign ? `, and ${ascendant.sign} rising` : ""
          }, your chart reveals a naturally intuitive personality — one shaped by inward emotional depth, resilience, and meaningful connection.`;
      }
    }

    // "Rising Sign" card -> icon + sign name + admin-managed description
    const risingSignName = user.birthChart?.ascendant?.sign || null;
    const risingSignContent = risingSignName
      ? await ZodiacSignContent.findOne({ signName: risingSignName })
      : null;

    const risingSign = risingSignName
      ? {
        sign: risingSignName,
        icon: risingSignContent?.icon || "",
        description: risingSignContent?.description || null,
      }
      : null;

    const signSummary = {
      sunSign: user.birthChart?.sunSign || null,
      moonSign: user.birthChart?.moonSign || null,
      risingSign: risingSignName,
    };

    // "Daily Reading" teaser -> MUST be TODAY'S reading (by date)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [dailyReading, weeklyReading, moonContent, poweredBy] = await Promise.all([
      DailyReading.findOne({
        date: { $gte: todayStart, $lt: todayEnd },
        isActive: true,
      }),
      WeeklyReading.findOne({ isActive: true }).sort({ weekStartDate: -1 }),
      // "Today's Moon" card content -> keywords + description come from
      // MoonPhaseInfo in the DB (admin-managed), not a hardcoded map.
      MoonPhaseInfo.findOne({ phaseName: moonPhase.phaseName }),
      // "Powered By" footer -> admin-managed list, not a hardcoded array.
      PoweredByContent.find({ isActive: true }).sort({ order: 1 }),
    ]);

    const todaysMoon = {
      phaseName: moonPhase.phaseName,
      // FIX: Celestial main screen's moon card shows illumination % and
      // moon age ("8%", "4.2 Days") - these were missing before.
      illuminationPercent: moonPhase.illuminationPercent,
      moonAgeDays: moonPhase.moonAgeDays,
      keywords: moonContent?.keywords || [],
      description: moonContent?.description || null,
      image: moonContent?.image || null,
    };

    // ---------------------------------------------------------------
    // Check if Daily / Weekly Reading is bookmarked (SavedItem)
    // NOTE: requires `const SavedItem = require("../../models/SavedItem");`
    // at the top of this file if it isn't already imported. Assumes
    // SavedItem has "dailyReading" / "weeklyReading" ref fields and
    // "reading" / "weeklyReading" type values, same as the /home API.
    // ---------------------------------------------------------------
    let isDailyReadingSaved = false;

    if (dailyReading) {
      const savedDailyItem = await SavedItem.findOne({
        user: user._id,
        type: "reading",
        dailyReading: dailyReading._id,
        isArchived: false,
      }).select("_id");

      isDailyReadingSaved = !!savedDailyItem;
    }

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

    return success(res, "Celestial overview fetched.", {
      date: new Date(),
      moonPhase,
      todaysMoon,
      planetaryPositions,
      birthChartAvailable: hasBirthChart,
      birthChartSummary,
      risingSign,
      signSummary,
      dailyReading: dailyReading
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
        : null,
      // Weekly reading -> was only returning id/title/summary/heroImage
      // before; expanded to include the rest of the WeeklyReading
      // schema fields so it matches the same level of detail as daily
      // reading needs on the weekly screen.
      weeklyReading: weeklyReading
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
          creativeRitual: weeklyReading.creativeRitual,
          isSaved: isWeeklyReadingSaved,
        }
        : null,
      poweredBy: poweredBy.map((p) => ({
        title: p.title,
        description: p.description,
        icon: p.icon,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. GET BIRTH CHART -> GET /api/celestial/birth-chart                */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
// exports.getBirthChart = async (req, res, next) => {
//   try {
//     const user = req.user;

//     if (!user.birthInfo || !user.birthInfo.dateOfBirth) {
//       return error(res, "Please complete your birth information first.", 400);
//     }

//     if (!user.birthChart || !user.birthChart.calculatedAt) {
//       const chart = calculateBirthChart({
//         dateOfBirth: user.birthInfo.dateOfBirth,
//         birthTime: user.birthInfo.birthTime,
//         isExactTime: user.birthInfo.isExactTime,
//         latitude: user.birthInfo.latitude,
//         longitude: user.birthInfo.longitude,
//         timezone: user.birthInfo.timezone,
//       });
//       user.birthChart = chart;
//       await user.save();
//     }

//     const personalityContent = user.birthChart.sunSign
//       ? await BirthChartPersonalityContent.findOne({
//           sunSign: user.birthChart.sunSign,
//         })
//       : null;

//     const risingSignName = user.birthChart.ascendant?.sign || null;
//     const risingSignContent = risingSignName
//       ? await ZodiacSignContent.findOne({ signName: risingSignName })
//       : null;

//     return success(res, "Birth chart fetched.", {
//       birthInfo: user.birthInfo,
//       birthChart: user.birthChart,
//       personalitySummary: personalityContent?.personalitySummary || null,
//       traits: personalityContent?.traits || [],
//       risingSign: risingSignName
//         ? {
//             sign: risingSignName,
//             icon: risingSignContent?.icon || "",
//             description: risingSignContent?.description || null,
//           }
//         : null,
//       signSummary: {
//         sunSign: user.birthChart.sunSign || null,
//         moonSign: user.birthChart.moonSign || null,
//         risingSign: risingSignName,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };


/* ------------------------------------------------------------------ */
/*  2. GET BIRTH CHART -> GET /api/celestial/birth-chart                */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getBirthChart = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.birthInfo || !user.birthInfo.dateOfBirth) {
      return error(res, "Please complete your birth information first.", 400);
    }

    if (!user.birthChart || !user.birthChart.calculatedAt) {
      const chart = calculateBirthChart({
        dateOfBirth: user.birthInfo.dateOfBirth,
        birthTime: user.birthInfo.birthTime,
        isExactTime: user.birthInfo.isExactTime,
        latitude: user.birthInfo.latitude,
        longitude: user.birthInfo.longitude,
        timezone: user.birthInfo.timezone,
      });
      user.birthChart = chart;
      await user.save();
    }

    const personalityContent = user.birthChart.sunSign
      ? await BirthChartPersonalityContent.findOne({
        sunSign: user.birthChart.sunSign,
      })
      : null;

    const risingSignName = user.birthChart.ascendant?.sign || null;
    const risingSignContent = risingSignName
      ? await ZodiacSignContent.findOne({ signName: risingSignName })
      : null;

    // NAYA: "Planetary Position" cards (Birth Chart screen) me bhi icon
    // chahiye - same tarika jo Celestial overview me kiya tha. Ek hi
    // query se Planet collection fetch kar ke name se icon map banaya,
    // phir birthChart.planets[] me merge kiya.
    const allPlanets = await Planet.find();
    const planetIconByName = {};
    allPlanets.forEach((p) => {
      planetIconByName[p.name.toLowerCase()] = p.icon || "";
    });

    const birthChartWithIcons = {
      ...(user.birthChart.toObject ? user.birthChart.toObject() : user.birthChart),
      planets: (user.birthChart.planets || []).map((p) => ({
        ...(p.toObject ? p.toObject() : p),
        icon: planetIconByName[p.name.toLowerCase()] || "",
      })),
    };

    return success(res, "Birth chart fetched.", {
      birthInfo: user.birthInfo,
      birthChart: birthChartWithIcons,
      personalitySummary: personalityContent?.personalitySummary || null,
      strengths: personalityContent?.strengths || [],
      growthAreas: personalityContent?.growthAreas || [],
      cosmicGift: personalityContent?.cosmicGift || null,
      risingSign: risingSignName
        ? {
          sign: risingSignName,
          icon: risingSignContent?.icon || "",
          description: risingSignContent?.description || null,
        }
        : null,
      signSummary: {
        sunSign: user.birthChart.sunSign || null,
        moonSign: user.birthChart.moonSign || null,
        risingSign: risingSignName,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. RECALCULATE BIRTH CHART -> POST /api/celestial/recalculate-chart */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.recalculateBirthChart = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.birthInfo || !user.birthInfo.dateOfBirth) {
      return error(res, "Please complete your birth information first.", 400);
    }

    if (user.birthInfo.birthPlace && !user.birthInfo.latitude) {
      const geo = await geocodePlace(user.birthInfo.birthPlace);
      user.birthInfo.latitude = geo.latitude;
      user.birthInfo.longitude = geo.longitude;
      user.birthInfo.timezone = geo.timezone;
    }

    const chart = calculateBirthChart({
      dateOfBirth: user.birthInfo.dateOfBirth,
      birthTime: user.birthInfo.birthTime,
      isExactTime: user.birthInfo.isExactTime,
      latitude: user.birthInfo.latitude,
      longitude: user.birthInfo.longitude,
      timezone: user.birthInfo.timezone,
    });
    user.birthChart = chart;
    await user.save();

    return success(res, "Birth chart recalculated.", { birthChart: user.birthChart });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  4. GET MOON PHASE DETAIL -> GET /api/celestial/moon-phase           */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
// exports.getMoonPhaseDetail = async (req, res, next) => {
//   try {
//     const user = req.user;
//     const timezone = user.timezone || "Asia/Kolkata";
//     const moonPhase = calculateMoonPhase(new Date(), timezone);

//     // ---------- Illumination (live calculated) ----------
//     const illuminationPercent =
//       moonPhase.illuminationPercent != null
//         ? Number(moonPhase.illuminationPercent).toFixed(1)
//         : null;

//     // ---------- Lunar Cycle Progress (derived from live elongation) ----------
//     const SYNODIC_MONTH_DAYS = 29.53;
//     const dayInCycle = moonPhase.elongation
//       ? Math.round((moonPhase.elongation / 360) * SYNODIC_MONTH_DAYS * 10) / 10
//       : null;

//     const lunarCycle = {
//       dayInCycle,
//       totalDays: SYNODIC_MONTH_DAYS,
//       progressPercent: moonPhase.elongation
//         ? Math.round((moonPhase.elongation / 360) * 100)
//         : null,
//       label: dayInCycle
//         ? `Day ${String(Math.floor(dayInCycle)).padStart(2, "0")} of ~${SYNODIC_MONTH_DAYS}`
//         : null,
//     };

//     // ---------- Current Sign Date ----------
//     const currentDate = moonPhase.calculatedAt || new Date();
//     const formattedSignDate = moment(currentDate)
//       .tz(moonPhase.timezone || "UTC")
//       .format("MM/DD/YY");

//     // ---------- Admin Content (fully DB-driven) ----------
//     const guideContent = await MoonPhaseInfo.findOne({
//       phaseName: moonPhase.phaseName,
//     });

//     // FIX: pehle admin-managed UpcomingMoonEvent DB entries use ho rahi
//     // thi (manual data entry chahiye thi). Ab automatically calculate
//     // hota hai - koi admin input ki zaroorat nahi, jaisa Rhythm dashboard
//     // me pehle se ban chuka hai.
//     const upcomingPhasesRaw = getUpcomingMoonPhases(new Date(), timezone);

//     // NAYA: "Celestial Schedule" card (moonrise/moonset times) - user ke
//     // birthInfo lat/long se calculate hota hai, jaisa Rhythm dashboard me
//     // pehle se ban chuka hai. Location set na ho to null aayega.
//     const celestialSchedule = calculateMoonRiseSet(
//       new Date(),
//       user.birthInfo?.latitude,
//       user.birthInfo?.longitude,
//       timezone
//     );

//     return success(res, "Moon phase detail fetched.", {
//       phaseName: moonPhase.phaseName,
//       keywords: guideContent?.keywords || [],

//       illumination: illuminationPercent,
//       illuminationLabel: illuminationPercent ? `${illuminationPercent}%` : null,

//       currentPhase: {
//         name: moonPhase.phaseName,
//         illumination: illuminationPercent,
//         illuminationLabel: illuminationPercent ? `${illuminationPercent}%` : null,
//       },

//       currentSign: {
//         name: moonPhase.currentSign || null,
//         date: formattedSignDate,
//       },

//       illuminationCard: {
//         value: illuminationPercent,
//         label: illuminationPercent ? `${illuminationPercent}%` : null,
//         progressPercent: illuminationPercent
//           ? Math.round(Number(illuminationPercent))
//           : null,
//       },

//       lunarCycle,

//       celestialSchedule,

//       // FIX: ab computed dates hain (phaseName + date), DB se subtitle/time
//       // nahi milega kyunki admin entry hata di - sirf formattedDate add
//       // kiya display ke liye.
//       upcomingPhases: upcomingPhasesRaw.map((p) => ({
//         phaseName: p.phaseName,
//         date: p.date,
//         formattedDate: formatUpcomingDate(p.date),
//       })),

//       guide: {
//         // Fully DB-driven — no hardcoded fallback text. Seed empty
//         // skeleton entries via seedMoonPhaseInfo.js, then the admin fills
//         // in real content from /admin/content/moon-phases.
//         description: guideContent?.description || null,
//         fullGuideContent: guideContent?.guideContent || null,
//         image: guideContent?.image || null,
//         // NAYA: Moon detail screen ke niche wala short poetic quote
//         // (e.g. "The moon does not fight the dark...")
//         affirmation: guideContent?.affirmation || null,
//         buttonText: "View full Moon Guide",
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };


exports.getMoonPhaseDetail = async (req, res, next) => {
  try {
    const user = req.user;
    const timezone = user.timezone || "Asia/Kolkata";
    const moonPhase = calculateMoonPhase(new Date(), timezone);

    // ---------- Illumination (live calculated) ----------
    const illuminationPercent =
      moonPhase.illuminationPercent != null
        ? Number(moonPhase.illuminationPercent).toFixed(1)
        : null;

    // ---------- Lunar Cycle Progress ----------
    // FIX: pehle yaha khud se ek alag formula (elongation/360 * 29.53) se
    // dayInCycle calculate ho raha tha - jabki calculateMoonPhase() pehle
    // se hi moonAgeDays deta hai (Rhythm/Celestial main me consistent use
    // ho raha hai). Ab wahi reuse kiya, taaki value har jagah match kare.
    const moonAgeDays = moonPhase.moonAgeDays;
    const SYNODIC_MONTH_DAYS = moonPhase.synodicMonthDays || 29.530588;

    const lunarCycle = {
      dayInCycle: moonAgeDays,
      totalDays: SYNODIC_MONTH_DAYS,
      progressPercent: moonAgeDays
        ? Math.round((moonAgeDays / SYNODIC_MONTH_DAYS) * 100)
        : null,
      label: moonAgeDays
        ? `Day ${String(Math.floor(moonAgeDays)).padStart(2, "0")} of ~${Math.round(
          SYNODIC_MONTH_DAYS
        )}`
        : null,
    };

    // ---------- Current Sign Date ----------
    const currentDate = moonPhase.calculatedAt || new Date();
    const formattedSignDate = moment(currentDate)
      .tz(moonPhase.timezone || "UTC")
      .format("MM/DD/YY");

    // ---------- Admin Content (fully DB-driven) ----------
    const guideContent = await MoonPhaseInfo.findOne({
      phaseName: moonPhase.phaseName,
    });

    // NAYA: Current Sign card ke liye description bhi chahiye - pehle
    // sirf naam+date tha. Same ZodiacSignContent collection use kiya jo
    // Rising Sign ke liye Celestial overview me use hoti hai.
    const currentSignContent = moonPhase.currentSign
      ? await ZodiacSignContent.findOne({ signName: moonPhase.currentSign })
      : null;

    // FIX: pehle admin-managed UpcomingMoonEvent DB entries use ho rahi
    // thi (manual data entry chahiye thi). Ab automatically calculate
    // hota hai - koi admin input ki zaroorat nahi, jaisa Rhythm dashboard
    // me pehle se ban chuka hai.
    const upcomingPhasesRaw = getUpcomingMoonPhases(new Date(), timezone);

    // NAYA: "Celestial Schedule" card (moonrise/moonset times) - user ke
    // birthInfo lat/long se calculate hota hai, jaisa Rhythm dashboard me
    // pehle se ban chuka hai. Location set na ho to null aayega.
    const celestialSchedule = calculateMoonRiseSet(
      new Date(),
      user.birthInfo?.latitude,
      user.birthInfo?.longitude,
      timezone
    );

    return success(res, "Moon phase detail fetched.", {
      phaseName: moonPhase.phaseName,
      keywords: guideContent?.keywords || [],

      illumination: illuminationPercent,
      illuminationLabel: illuminationPercent ? `${illuminationPercent}%` : null,
      moonAgeDays,

      currentPhase: {
        name: moonPhase.phaseName,
        illumination: illuminationPercent,
        illuminationLabel: illuminationPercent ? `${illuminationPercent}%` : null,
      },

      currentSign: {
        name: moonPhase.currentSign || null,
        date: formattedSignDate,
        // NAYA: sign ka description bhi add kiya (ZodiacSignContent se)
        icon: currentSignContent?.icon || "",
        description: currentSignContent?.description || null,
      },

      illuminationCard: {
        value: illuminationPercent,
        label: illuminationPercent ? `${illuminationPercent}%` : null,
        progressPercent: illuminationPercent
          ? Math.round(Number(illuminationPercent))
          : null,
      },

      lunarCycle,

      celestialSchedule,

      // FIX: ab computed dates hain (phaseName + date), DB se subtitle/time
      // nahi milega kyunki admin entry hata di - sirf formattedDate add
      // kiya display ke liye.
      upcomingPhases: upcomingPhasesRaw.map((p) => ({
        phaseName: p.phaseName,
        date: p.date,
        formattedDate: formatUpcomingDate(p.date),
      })),

      guide: {
        // Fully DB-driven — no hardcoded fallback text. Seed empty
        // skeleton entries via seedMoonPhaseInfo.js, then the admin fills
        // in real content from /admin/content/moon-phases.
        description: guideContent?.description || null,
        fullGuideContent: guideContent?.guideContent || null,
        image: guideContent?.image || null,
        // NAYA: Moon detail screen ke niche wala short poetic quote
        // (e.g. "The moon does not fight the dark...")
        affirmation: guideContent?.affirmation || null,
        buttonText: "View full Moon Guide",
      },
    });
  } catch (err) {
    next(err);
  }
};

function formatUpcomingDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}


/* ------------------------------------------------------------------ */
/*  5. GET PLANET DETAIL -> GET /api/celestial/planets/:name            */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
// exports.getPlanetDetail = async (req, res, next) => {
//   try {
//     const planetContent = await Planet.findOne({
//       name: new RegExp(`^${req.params.name}$`, "i"),
//     });

//     if (!planetContent) {
//       return error(res, "Planet not found.", 404);
//     }

//     const user = req.user;
//     const userPlacement =
//       user.birthChart?.planets?.find(
//         (p) => p.name.toLowerCase() === req.params.name.toLowerCase()
//       ) || null;

//     return success(res, "Planet detail fetched.", {
//       planet: planetContent,
//       yourPlacement: userPlacement
//         ? {
//             sign: userPlacement.sign,
//             degreeFormatted: userPlacement.degreeFormatted,
//             label: `${userPlacement.degreeFormatted} ${userPlacement.sign}`,
//           }
//         : null,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getMoonPhaseDetail = async (req, res, next) => {
  try {
    const user = req.user;
    const timezone = user.timezone || "Asia/Kolkata";
    const moonPhase = calculateMoonPhase(new Date(), timezone);

    // ---------- Illumination (live calculated) ----------
    const illuminationPercent =
      moonPhase.illuminationPercent != null
        ? Number(moonPhase.illuminationPercent).toFixed(1)
        : null;

    // ---------- Lunar Cycle Progress ----------
    // FIX: pehle yaha khud se ek alag formula (elongation/360 * 29.53) se
    // dayInCycle calculate ho raha tha - jabki calculateMoonPhase() pehle
    // se hi moonAgeDays deta hai (Rhythm/Celestial main me consistent use
    // ho raha hai). Ab wahi reuse kiya, taaki value har jagah match kare.
    const moonAgeDays = moonPhase.moonAgeDays;
    const SYNODIC_MONTH_DAYS = moonPhase.synodicMonthDays || 29.530588;

    const lunarCycle = {
      dayInCycle: moonAgeDays,
      totalDays: SYNODIC_MONTH_DAYS,
      progressPercent: moonAgeDays
        ? Math.round((moonAgeDays / SYNODIC_MONTH_DAYS) * 100)
        : null,
      label: moonAgeDays
        ? `Day ${String(Math.floor(moonAgeDays)).padStart(2, "0")} of ~${Math.round(
          SYNODIC_MONTH_DAYS
        )}`
        : null,
    };

    // ---------- Current Sign Date ----------
    const currentDate = moonPhase.calculatedAt || new Date();
    const formattedSignDate = moment(currentDate)
      .tz(moonPhase.timezone || "UTC")
      .format("MM/DD/YY");

    // ---------- Admin Content (fully DB-driven) ----------
    const guideContent = await MoonPhaseInfo.findOne({
      phaseName: moonPhase.phaseName,
    });

    // NAYA: Current Sign card ke liye description bhi chahiye - pehle
    // sirf naam+date tha. Same ZodiacSignContent collection use kiya jo
    // Rising Sign ke liye Celestial overview me use hoti hai.
    const currentSignContent = moonPhase.currentSign
      ? await ZodiacSignContent.findOne({ signName: moonPhase.currentSign })
      : null;

    // FIX: pehle admin-managed UpcomingMoonEvent DB entries use ho rahi
    // thi (manual data entry chahiye thi). Ab automatically calculate
    // hota hai - koi admin input ki zaroorat nahi, jaisa Rhythm dashboard
    // me pehle se ban chuka hai.
    const upcomingPhasesRaw = getUpcomingMoonPhases(new Date(), timezone);

    // NAYA: "Celestial Schedule" card (moonrise/moonset times) - user ke
    // birthInfo lat/long se calculate hota hai, jaisa Rhythm dashboard me
    // pehle se ban chuka hai. Location set na ho to null aayega.
    const celestialSchedule = calculateMoonRiseSet(
      new Date(),
      user.birthInfo?.latitude,
      user.birthInfo?.longitude,
      timezone
    );

    return success(res, "Moon phase detail fetched.", {
      phaseName: moonPhase.phaseName,
      keywords: guideContent?.keywords || [],

      illumination: illuminationPercent,
      illuminationLabel: illuminationPercent ? `${illuminationPercent}%` : null,
      moonAgeDays,

      currentPhase: {
        name: moonPhase.phaseName,
        illumination: illuminationPercent,
        illuminationLabel: illuminationPercent ? `${illuminationPercent}%` : null,
      },

      currentSign: {
        name: moonPhase.currentSign || null,
        date: formattedSignDate,
        // NAYA: sign ka description bhi add kiya (ZodiacSignContent se)
        icon: currentSignContent?.icon || "",
        description: currentSignContent?.description || null,
      },

      illuminationCard: {
        value: illuminationPercent,
        label: illuminationPercent ? `${illuminationPercent}%` : null,
        progressPercent: illuminationPercent
          ? Math.round(Number(illuminationPercent))
          : null,
      },

      lunarCycle,

      celestialSchedule,

      // FIX: ab computed dates hain (phaseName + date), DB se subtitle/time
      // nahi milega kyunki admin entry hata di - sirf formattedDate add
      // kiya display ke liye.
      upcomingPhases: upcomingPhasesRaw.map((p) => ({
        phaseName: p.phaseName,
        date: p.date,
        formattedDate: formatUpcomingDate(p.date),
      })),

      guide: {
        // Fully DB-driven — no hardcoded fallback text. Seed empty
        // skeleton entries via seedMoonPhaseInfo.js, then the admin fills
        // in real content from /admin/content/moon-phases.
        description: guideContent?.description || null,
        fullGuideContent: guideContent?.guideContent || null,
        image: guideContent?.image || null,
        // NAYA: Moon detail screen ke niche wala short poetic quote
        // (e.g. "The moon does not fight the dark...")
        affirmation: guideContent?.affirmation || null,
        buttonText: "View full Moon Guide",
      },
    });
  } catch (err) {
    next(err);
  }
};

function formatUpcomingDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  5. GET PLANET DETAIL -> GET /api/celestial/planets/:name            */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getPlanetDetail = async (req, res, next) => {
  try {
    const planetContent = await Planet.findOne({
      name: new RegExp(`^${req.params.name}$`, "i"),
    });

    if (!planetContent) {
      return error(res, "Planet not found.", 404);
    }

    const user = req.user;
    const userPlacement =
      user.birthChart?.planets?.find(
        (p) => p.name.toLowerCase() === req.params.name.toLowerCase()
      ) || null;

    // NAYA: "14° 22' Libra" ke niche wala description text - user ke
    // placement sign ka ZodiacSignContent se reuse kiya. Simple approach
    // hai, generic hai (planet-specific nuance nahi), lekin data-driven
    // hai aur admin panel se hi manage hoti hai.
    const signContent = userPlacement?.sign
      ? await ZodiacSignContent.findOne({ signName: userPlacement.sign })
      : null;

    return success(res, "Planet detail fetched.", {
      planet: planetContent,
      yourPlacement: userPlacement
        ? {
          sign: userPlacement.sign,
          degreeFormatted: userPlacement.degreeFormatted,
          label: `${userPlacement.degreeFormatted} ${userPlacement.sign}`,
          description: signContent?.description || null,
        }
        : null,
    });
  } catch (err) {
    next(err);
  }
};
