const OnboardingSlide = require("../../models/OnboardingSlide");
const User = require("../../models/User");
const generateToken = require("../../utils/generateToken");
const { success, error } = require("../../utils/response");
const { geocodePlace } = require("../../utils/geocode");
const { calculateBirthChart } = require("../../utils/Astrologyservice");

/* ------------------------------------------------------------------ */
/*  1. GET SPLASH / WELCOME SLIDES -> GET /api/onboarding/slides       */
/*  Figma: "Splash screen" + "Onboarding 1" (Welcome to MEIA) - static */
/*  content, shown before signup, so this stays a GET.                 */
/* ------------------------------------------------------------------ */
exports.getSlides = async (req, res, next) => {
  try {
    const slides = await OnboardingSlide.find({ isActive: true }).sort({
      order: 1,
    });

    return success(res, "Onboarding slides fetched.", { slides });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  1.5 SAVE SYNC PREFERENCE -> POST /api/onboarding/sync-preference  */
/*  Figma: "How shall we sync your MEIA?" (Onboarding 9)              */
/*  Options:                                                          */
/*    - "cycle"  → full period-tracking flow (girls)                  */
/*    - "stars"  → astrology-only flow (boys / non-cycle)             */
/*  Must be called right after the welcome slides / before any data.  */
/* ------------------------------------------------------------------ */
exports.saveSyncPreference = async (req, res, next) => {
  try {
    const { syncPreference } = req.body;

    if (!syncPreference || !["cycle", "stars"].includes(syncPreference)) {
      return error(res, 'syncPreference must be either "cycle" or "stars".', 422);
    }

    const user = req.user;
    user.syncPreference = syncPreference; 
    await user.save();

    return success(res, "Sync preference saved.", {
      syncPreference: user.syncPreference,
      // Frontend can decide the next screen from this
      nextStep: syncPreference === "cycle" ? "last-period-date" : "birth-info",
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  0. START ONBOARDING (GUEST) -> POST /api/onboarding/start          */
/*  Figma: right after "Let's Begin" on the welcome carousel, BEFORE   */
/*  the user has signed up. Creates a lightweight guest user document  */
/*  (no phone/mpin yet) and returns a short-lived token so every       */
/*  onboarding data-entry screen after this can be saved against it.  */
/*  This guest token is later "upgraded" into a real account when the */
/*  user finally hits Signup (phone -> OTP -> mpin) at the end.       */
/* ------------------------------------------------------------------ */
exports.startOnboarding = async (req, res, next) => {
  try {
    const user = await User.create({ isGuest: true });

    const token = generateToken(user._id);

    return success(res, "Onboarding started.", {
      userId: user._id,
      token, // guest token - use as Bearer token for all onboarding routes below
    }, 201);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. SAVE LAST PERIOD DATE -> POST /api/onboarding/last-period-date  */
/*  Figma: "Select date" screen -> "Select when your last period       */
/*  started" (calendar picker). Comes BEFORE Birth Information.        */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
// exports.saveLastPeriodDate = async (req, res, next) => {
//   try {
//     const { lastPeriodDate } = req.body;

//     if (!lastPeriodDate) {
//       return error(res, "Last period date is required.", 422);
//     }

//     const user = req.user;

//     if (!user.cycleInfo) {
//       user.cycleInfo = {};
//     }

//     user.cycleInfo.lastPeriodDate = lastPeriodDate;
//     await user.save();

//     return success(res, "Last period date saved successfully.", {
//       cycleInfo: user.cycleInfo,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.saveLastPeriodDate = async (req, res, next) => {
  try {
    const { lastPeriodDate } = req.body;

    // Allow null when user clicks "Not Sure"
    // Only reject if the field is completely missing (undefined)
    if (lastPeriodDate === undefined) {
      return error(res, "Last period date is required (or send null if not sure).", 422);
    }

    const user = req.user;

    if (!user.cycleInfo) {
      user.cycleInfo = {};
    }

    // null allowed → user is not sure
    user.cycleInfo.lastPeriodDate = lastPeriodDate; // can be date string or null
    await user.save();

    return success(res, "Last period date saved successfully.", {
      cycleInfo: user.cycleInfo,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. SAVE PERIOD LENGTH -> POST /api/onboarding/period-length        */
/*  Figma: "Select days" screen -> "How many days does your period     */
/*  usually last?" (3 days / 4 days / 5 days options). Comes BEFORE     */
/*  Birth Information.                                                  */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
// exports.savePeriodLength = async (req, res, next) => {
//   try {
//     const { periodLength } = req.body;

//     if (!periodLength || periodLength < 1) {
//       return error(res, "A valid period length (in days) is required.", 422);
//     }

//     const user = req.user;

//     if (!user.cycleInfo) {
//       user.cycleInfo = {};
//     }

//     user.cycleInfo.averagePeriodLength = periodLength;
//     await user.save();

//     return success(res, "Period length saved successfully.", {
//       cycleInfo: user.cycleInfo,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
exports.savePeriodLength = async (req, res, next) => {
  try {
    const { periodLength } = req.body;

    // Allow null when user clicks "Not Sure"
    if (periodLength === undefined) {
      return error(res, "Period length is required (or send null if not sure).", 422);
    }

    // Agar null nahi hai to valid number check karo
    if (periodLength !== null && (isNaN(periodLength) || periodLength < 1)) {
      return error(res, "A valid period length (in days) is required.", 422);
    }

    const user = req.user;

    if (!user.cycleInfo) {
      user.cycleInfo = {};
    }

    // null allowed → user is not sure
    user.cycleInfo.averagePeriodLength = periodLength; // can be number or null
    await user.save();

    return success(res, "Period length saved successfully.", {
      cycleInfo: user.cycleInfo,
    });
  } catch (err) {
    next(err);
  }
};

// exports.saveBirthInfo = async (req, res, next) => {
//   try {
//     const { dateOfBirth, birthPlace, birthTime, isExactTime } = req.body;

//     if (!dateOfBirth) {
//       return error(res, "Date of birth is required.", 422);
//     }

//     if (isExactTime !== false && !birthTime) {
//       return error(res, "Birth time is required, or set isExactTime to false.", 422);
//     }

//     const user = req.user;

//     if (!user.birthInfo) user.birthInfo = {};

//     user.birthInfo.dateOfBirth = dateOfBirth;
//     if (birthPlace !== undefined) user.birthInfo.birthPlace = birthPlace;

//     if (isExactTime === false) {
//       user.birthInfo.isExactTime = false;
//       user.birthInfo.birthTime = undefined;
//     } else {
//       user.birthInfo.isExactTime = true;
//       user.birthInfo.birthTime = birthTime;
//     }

//     // Geocode the birth place -> lat/lon + timezone (needed for accurate calc)
//     if (birthPlace) {
//       try {
//         const geo = await geocodePlace(birthPlace);
//         user.birthInfo.latitude = geo.latitude;
//         user.birthInfo.longitude = geo.longitude;
//         user.birthInfo.timezone = geo.timezone;
//       } catch (geoErr) {
//         console.warn("Geocoding failed:", geoErr.message);
//         // Don't block saving birth info just because geocoding failed -
//         // chart calculation below will simply skip the Ascendant.
//       }
//     }

//     // Calculate & cache the birth chart (real Swiss Ephemeris calculation)
//     try {
//       const chart = calculateBirthChart({
//         dateOfBirth: user.birthInfo.dateOfBirth,
//         birthTime: user.birthInfo.birthTime,
//         isExactTime: user.birthInfo.isExactTime,
//         latitude: user.birthInfo.latitude,
//         longitude: user.birthInfo.longitude,
//         timezone: user.birthInfo.timezone,
//       });
//       user.birthChart = chart;
//     } catch (chartErr) {
//       console.error("Birth chart calculation failed:", chartErr.message);
//       // Save birth info regardless; chart can be recalculated later via
//       // POST /api/celestial/recalculate-chart
//     }

//     await user.save();

//     return success(res, "Birth information saved.", {
//       birthInfo: user.birthInfo,
//       birthChart: user.birthChart,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

/* ============================================================
   Helper - validate & convert a 12-hour "hh:mm AM/PM" birth time
   into 24-hour "HH:mm" format for the chart calculation util.
   Accepts: "2:30 PM", "02:30 pm", "11:05 AM", etc.
============================================================ */
const TIME_12H_REGEX = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?([AaPp][Mm])$/;

const convertTo24Hour = (time12h) => {
  const match = time12h.trim().match(TIME_12H_REGEX);
  if (!match) return null;

  let [, hours, minutes, meridiem] = match;
  hours = parseInt(hours, 10);
  meridiem = meridiem.toUpperCase();

  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours !== 12) hours += 12;

  const hh = String(hours).padStart(2, "0");
  return `${hh}:${minutes}`;
};

exports.saveBirthInfo = async (req, res, next) => {
  try {
    const { dateOfBirth, birthPlace, birthTime } = req.body;
    let { isExactTime } = req.body;

    // NORMALIZE: if this route ever receives multipart/form-data or
    // x-www-form-urlencoded (instead of raw JSON), boolean values
    // arrive as the STRINGS "true"/"false", not actual booleans.
    // `isExactTime !== false` would then wrongly stay true for the
    // string "false", which is exactly what was causing this bug.
    // Default (nothing sent) is treated as true, same as before.
    const isExactTimeBool = !(isExactTime === false || isExactTime === "false");

    if (!dateOfBirth) {
      return error(res, "Date of birth is required.", 422);
    }

    if (isExactTimeBool && !birthTime) {
      return error(res, "Birth time is required, or set isExactTime to false.", 422);
    }

    // Validate & convert 12-hour AM/PM birth time (only when an exact
    // time is actually being provided).
    let birthTime24 = null;
    let storedBirthTime = birthTime; // jo user ne bheja

    if (isExactTimeBool && birthTime) {
      birthTime24 = convertTo24Hour(birthTime);

      if (!birthTime24) {
        return error(
          res,
          "Birth time must be in 12-hour format with AM/PM, e.g. '02:30 PM'.",
          422
        );
      }
    } else if (!isExactTimeBool) {
      // Agar exact time nahi hai → default 12:00 PM use karo calculation ke liye
      // Sirf tab jab pehle se birthTime set na ho
      storedBirthTime = "12:00 PM";
      birthTime24 = "12:00"; // 24-hour format
    }

    const user = req.user;

    if (!user.birthInfo) user.birthInfo = {};

    user.birthInfo.dateOfBirth = dateOfBirth;
    if (birthPlace !== undefined) user.birthInfo.birthPlace = birthPlace;

    if (!isExactTimeBool) {
      user.birthInfo.isExactTime = false;
      // Default time store karo (display ke liye bhi useful)
      user.birthInfo.birthTime = storedBirthTime; // "12:00 PM"
    } else {
      user.birthInfo.isExactTime = true;
      // Store the original AM/PM string as the user entered it
      user.birthInfo.birthTime = birthTime;
    }

    // Geocode the birth place -> lat/lon + timezone
    if (birthPlace) {
      try {
        const geo = await geocodePlace(birthPlace);
        user.birthInfo.latitude = geo.latitude;
        user.birthInfo.longitude = geo.longitude;
        user.birthInfo.timezone = geo.timezone;
      } catch (geoErr) {
        console.warn("Geocoding failed:", geoErr.message);
      }
    }

    // Calculate & cache the birth chart
    try {
      const chart = calculateBirthChart({
        dateOfBirth: user.birthInfo.dateOfBirth,
        birthTime: birthTime24,          // ab default "12:00" bhi aayega
        isExactTime: user.birthInfo.isExactTime,
        latitude: user.birthInfo.latitude,
        longitude: user.birthInfo.longitude,
        timezone: user.birthInfo.timezone,
      });
      user.birthChart = chart;
    } catch (chartErr) {
      console.error("Birth chart calculation failed:", chartErr.message);
    }

    await user.save();

    return success(res, "Birth information saved.", {
      birthInfo: user.birthInfo,
      birthChart: user.birthChart,
    });
  } catch (err) {
    next(err);
  }
};

exports.saveCycleInfo = async (req, res, next) => {
  try {
    const { lastPeriodDate, averageCycleLength } = req.body;

    if (!lastPeriodDate) {
      return error(res, "Last period date is required.", 422);
    }

    const user = req.user;

    // Ensure cycleInfo object exists
    if (!user.cycleInfo) {
      user.cycleInfo = {};
    }

    user.cycleInfo.lastPeriodDate = lastPeriodDate;

    if (averageCycleLength !== undefined) {
      user.cycleInfo.averageCycleLength = averageCycleLength;
    }

    await user.save();

    return success(res, "Cycle information saved successfully.", {
      cycleInfo: user.cycleInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.savePersonalization = async (req, res, next) => {
  try {
    const { preferredName, email, timeZone, notificationsEnabled } = req.body;

    const user = req.user;

    // ✅ Ensure personalization object exists
    if (!user.personalization) {
      user.personalization = {};
    }

    // Now safely update fields
    if (preferredName !== undefined) {
      user.personalization.preferredName = preferredName;
      user.name = preferredName; // keep top-level name in sync
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (timeZone !== undefined) {
      user.personalization.timeZone = timeZone;
    }

    if (notificationsEnabled !== undefined) {
      user.personalization.notificationsEnabled = notificationsEnabled;
    }

    await user.save();

    return success(res, "Personalization saved successfully.", {
      name: user.name,
      email: user.email,
      personalization: user.personalization,
    });
  } catch (err) {
    next(err);
  }
};


exports.completeOnboarding = async (req, res, next) => {
  try {
    const user = req.user;

    // Birth info is always required
    if (!user.birthInfo || !user.birthInfo.dateOfBirth) {
      return error(res, "Please complete birth information first.", 400);
    }

    // Cycle info is required ONLY when user chose the cycle path
    if (user.syncPreference === "cycle") {
      if (!user.cycleInfo || !user.cycleInfo.lastPeriodDate) {
        return error(res, "Please complete cycle information first.", 400);
      }
    }

    // If they somehow skipped the preference screen, force them back
    if (!user.syncPreference) {
      return error(res, "Please choose how you want to sync with MEIA first.", 400);
    }

    user.isOnboarded = true;
    await user.save();

    return success(res, "Onboarding completed. Please sign up to save your data.", {
      isOnboarded: user.isOnboarded,
      isGuest: user.isGuest,
      syncPreference: user.syncPreference,
      nextStep: "signup",
    });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = req.user;

    return success(res, "Onboarding status fetched.", {
      isOnboarded: user.isOnboarded,
      syncPreference: user.syncPreference,
      birthInfo: user.birthInfo,
      cycleInfo: user.cycleInfo,
      personalization: user.personalization,
    });
  } catch (err) {
    next(err);
  }
};