// const sweph = require("sweph");
// const moment = require("moment-timezone");
// const { longitudeToSign } = require("./Zodiacsigns");

// /*
//   Uses Swiss Ephemeris in "Moshier" mode - a built-in semi-analytic
//   ephemeris that requires NO external data files and NO commercial
//   license (public-domain math, accurate to within arc-seconds for
//   modern dates). If the project later obtains full-precision ephemeris
//   files + a Swiss Ephemeris commercial license, only FLAG below needs
//   to change (swap SEFLG_MOSEPH -> SEFLG_SWIEPH and call
//   sweph.set_ephe_path('/path/to/ephemeris/files')).
// */
// const FLAG = sweph.constants.SEFLG_MOSEPH;

// const PLANETS = [
//   { key: "sun", name: "Sun", id: sweph.constants.SE_SUN },
//   { key: "moon", name: "Moon", id: sweph.constants.SE_MOON },
//   { key: "mercury", name: "Mercury", id: sweph.constants.SE_MERCURY },
//   { key: "venus", name: "Venus", id: sweph.constants.SE_VENUS },
//   { key: "mars", name: "Mars", id: sweph.constants.SE_MARS },
//   { key: "jupiter", name: "Jupiter", id: sweph.constants.SE_JUPITER },
//   { key: "saturn", name: "Saturn", id: sweph.constants.SE_SATURN },
//   { key: "uranus", name: "Uranus", id: sweph.constants.SE_URANUS },
//   { key: "neptune", name: "Neptune", id: sweph.constants.SE_NEPTUNE },
//   { key: "pluto", name: "Pluto", id: sweph.constants.SE_PLUTO },
// ];

// /**
//  * Converts a local date/time + IANA timezone into a Julian Day (UT),
//  * which is what all Swiss Ephemeris functions require.
//  */
// function toJulianDay(dateStr, timeStr, timezone) {
//   const localMoment = moment.tz(
//     `${dateStr} ${timeStr || "12:00"}`,
//     "YYYY-MM-DD HH:mm",
//     timezone || "UTC"
//   );
//   const utcMoment = localMoment.clone().utc();

//   const hourDecimal =
//     utcMoment.hour() + utcMoment.minute() / 60 + utcMoment.second() / 3600;

//   return sweph.julday(
//     utcMoment.year(),
//     utcMoment.month() + 1,
//     utcMoment.date(),
//     hourDecimal,
//     sweph.constants.SE_GREG_CAL
//   );
// }

// /**
//  * Calculates positions of all major planets for a given Julian Day.
//  * Returns an array of { key, name, sign, degree, degreeFormatted, longitude }.
//  */
// function calculatePlanetPositions(julianDay) {
//   return PLANETS.map((planet) => {
//     const result = sweph.calc_ut(julianDay, planet.id, FLAG);
//     const longitude = result.data[0];
//     const { sign, degree, degreeFormatted } = longitudeToSign(longitude);

//     return {
//       key: planet.key,
//       name: planet.name,
//       sign,
//       degree,
//       degreeFormatted,
//       longitude,
//     };
//   });
// }

// /**
//  * Calculates the Ascendant (rising sign) and Midheaven for a birth
//  * chart. Requires exact birth time + coordinates - if birth time is
//  * unknown ("No Exact Time" screen), Ascendant should be omitted.
//  */
// function calculateAscendant(julianDay, latitude, longitude) {
//   const houses = sweph.houses(julianDay, latitude, longitude, "P"); // Placidus system
//   const ascendantLongitude = houses.data.points[0];
//   const mcLongitude = houses.data.points[1];

//   return {
//     ascendant: longitudeToSign(ascendantLongitude),
//     midheaven: longitudeToSign(mcLongitude),
//   };
// }

// /**
//  * Full birth chart calculation - used once at onboarding completion,
//  * result should be cached on the User document (see userController).
//  */
// function calculateBirthChart({ dateOfBirth, birthTime, isExactTime, latitude, longitude, timezone }) {
//   const dateStr = moment(dateOfBirth).format("YYYY-MM-DD");
//   const julianDay = toJulianDay(dateStr, isExactTime ? birthTime : "12:00", timezone);

//   const planets = calculatePlanetPositions(julianDay);

//   let ascendantData = null;
//   if (isExactTime && latitude !== undefined && longitude !== undefined) {
//     ascendantData = calculateAscendant(julianDay, latitude, longitude);
//   }

//   return {
//     planets,
//     ascendant: ascendantData ? ascendantData.ascendant : null,
//     midheaven: ascendantData ? ascendantData.midheaven : null,
//     sunSign: planets.find((p) => p.key === "sun")?.sign,
//     moonSign: planets.find((p) => p.key === "moon")?.sign,
//     calculatedAt: new Date(),
//   };
// }

// /**
//  * Current transiting planetary positions "for today" - used on Home/
//  * Celestial overview screens (not birth-specific).
//  */
// function calculateCurrentTransits() {
//   const now = moment.utc();
//   const julianDay = sweph.julday(
//     now.year(),
//     now.month() + 1,
//     now.date(),
//     now.hour() + now.minute() / 60,
//     sweph.constants.SE_GREG_CAL
//   );

//   return calculatePlanetPositions(julianDay);
// }

// /**
//  * Moon phase (0-1 illumination fraction + phase name) for a given date
//  * (defaults to now). Used on Home + Moon Detail screens.
//  */
// // function calculateMoonPhase(date = new Date()) {
// //   const m = moment.utc(date);
// //   const julianDay = sweph.julday(
// //     m.year(),
// //     m.month() + 1,
// //     m.date(),
// //     m.hour() + m.minute() / 60,
// //     sweph.constants.SE_GREG_CAL
// //   );

// //   const pheno = sweph.pheno_ut(julianDay, sweph.constants.SE_MOON, FLAG);
// //   const illumination = pheno.data[1]; // fraction illuminated, 0-1

// //   const sunPos = sweph.calc_ut(julianDay, sweph.constants.SE_SUN, FLAG).data[0];
// //   const moonPos = sweph.calc_ut(julianDay, sweph.constants.SE_MOON, FLAG).data[0];
// //   let elongation = moonPos - sunPos;
// //   if (elongation < 0) elongation += 360;

// //   let phaseName;
// //   if (elongation < 22.5) phaseName = "New Moon";
// //   else if (elongation < 67.5) phaseName = "Waxing Crescent";
// //   else if (elongation < 112.5) phaseName = "First Quarter";
// //   else if (elongation < 157.5) phaseName = "Waxing Gibbous";
// //   else if (elongation < 202.5) phaseName = "Full Moon";
// //   else if (elongation < 247.5) phaseName = "Waning Gibbous";
// //   else if (elongation < 292.5) phaseName = "Last Quarter";
// //   else if (elongation < 337.5) phaseName = "Waning Crescent";
// //   else phaseName = "New Moon";

// //   const { sign } = longitudeToSign(moonPos);

// //   return {
// //     phaseName,
// //     illuminationPercent: Math.round(illumination * 100),
// //     currentSign: sign,
// //     date: m.toDate(),
// //   };
// // }

// function calculateMoonPhase(date = new Date(), timezone = "UTC") {
//   // Convert date into requested timezone
//   const m = moment(date).tz(timezone);

//   // Convert to UTC because Swiss Ephemeris works in UT
//   const utc = m.clone().utc();

//   const julianDay = sweph.julday(
//     utc.year(),
//     utc.month() + 1,
//     utc.date(),
//     utc.hour() +
//       utc.minute() / 60 +
//       utc.second() / 3600,
//     sweph.constants.SE_GREG_CAL
//   );

//   const pheno = sweph.pheno_ut(
//     julianDay,
//     sweph.constants.SE_MOON,
//     FLAG
//   );

//   const illumination = pheno.data[1];

//   const sunLongitude = sweph.calc_ut(
//     julianDay,
//     sweph.constants.SE_SUN,
//     FLAG
//   ).data[0];

//   const moonLongitude = sweph.calc_ut(
//     julianDay,
//     sweph.constants.SE_MOON,
//     FLAG
//   ).data[0];

//   let elongation = moonLongitude - sunLongitude;

//   if (elongation < 0) {
//     elongation += 360;
//   }

//   let phaseName = "";

//   if (elongation < 22.5) phaseName = "New Moon";
//   else if (elongation < 67.5) phaseName = "Waxing Crescent";
//   else if (elongation < 112.5) phaseName = "First Quarter";
//   else if (elongation < 157.5) phaseName = "Waxing Gibbous";
//   else if (elongation < 202.5) phaseName = "Full Moon";
//   else if (elongation < 247.5) phaseName = "Waning Gibbous";
//   else if (elongation < 292.5) phaseName = "Last Quarter";
//   else if (elongation < 337.5) phaseName = "Waning Crescent";
//   else phaseName = "New Moon";

//   const { sign } = longitudeToSign(moonLongitude);

//   return {
//     phaseName,
//     illuminationPercent: Number((illumination * 100).toFixed(1)),
//     illuminationFraction: illumination,
//     currentSign: sign,
//     moonLongitude,
//     sunLongitude,
//     elongation,
//     calculatedAt: utc.toDate(),
//     timezone
//   };
// }

// module.exports = {
//   toJulianDay,
//   calculatePlanetPositions,
//   calculateAscendant,
//   calculateBirthChart,
//   calculateCurrentTransits,
//   calculateMoonPhase,
// };

const sweph = require("sweph");
const moment = require("moment-timezone");
const { longitudeToSign } = require("./Zodiacsigns");

/*
  Uses Swiss Ephemeris in "Moshier" mode - a built-in semi-analytic
  ephemeris that requires NO external data files and NO commercial
  license (public-domain math, accurate to within arc-seconds for
  modern dates). If the project later obtains full-precision ephemeris
  files + a Swiss Ephemeris commercial license, only FLAG below needs
  to change (swap SEFLG_MOSEPH -> SEFLG_SWIEPH and call
  sweph.set_ephe_path('/path/to/ephemeris/files')).
*/
const FLAG = sweph.constants.SEFLG_MOSEPH;

const PLANETS = [
  { key: "sun", name: "Sun", id: sweph.constants.SE_SUN },
  { key: "moon", name: "Moon", id: sweph.constants.SE_MOON },
  { key: "mercury", name: "Mercury", id: sweph.constants.SE_MERCURY },
  { key: "venus", name: "Venus", id: sweph.constants.SE_VENUS },
  { key: "mars", name: "Mars", id: sweph.constants.SE_MARS },
  { key: "jupiter", name: "Jupiter", id: sweph.constants.SE_JUPITER },
  { key: "saturn", name: "Saturn", id: sweph.constants.SE_SATURN },
  { key: "uranus", name: "Uranus", id: sweph.constants.SE_URANUS },
  { key: "neptune", name: "Neptune", id: sweph.constants.SE_NEPTUNE },
  { key: "pluto", name: "Pluto", id: sweph.constants.SE_PLUTO },
];

/**
 * Converts a local date/time + IANA timezone into a Julian Day (UT),
 * which is what all Swiss Ephemeris functions require.
 */
function toJulianDay(dateStr, timeStr, timezone) {
  const localMoment = moment.tz(
    `${dateStr} ${timeStr || "12:00"}`,
    "YYYY-MM-DD HH:mm",
    timezone || "UTC"
  );
  const utcMoment = localMoment.clone().utc();

  const hourDecimal =
    utcMoment.hour() + utcMoment.minute() / 60 + utcMoment.second() / 3600;

  return sweph.julday(
    utcMoment.year(),
    utcMoment.month() + 1,
    utcMoment.date(),
    hourDecimal,
    sweph.constants.SE_GREG_CAL
  );
}

/**
 * Calculates positions of all major planets for a given Julian Day.
 * Returns an array of { key, name, sign, degree, degreeFormatted, longitude }.
 */
function calculatePlanetPositions(julianDay) {
  return PLANETS.map((planet) => {
    const result = sweph.calc_ut(julianDay, planet.id, FLAG);
    const longitude = result.data[0];
    const { sign, degree, degreeFormatted } = longitudeToSign(longitude);

    return {
      key: planet.key,
      name: planet.name,
      sign,
      degree,
      degreeFormatted,
      longitude,
    };
  });
}

/**
 * Calculates the Ascendant (rising sign) and Midheaven for a birth
 * chart. Requires exact birth time + coordinates - if birth time is
 * unknown ("No Exact Time" screen), Ascendant should be omitted.
 */
function calculateAscendant(julianDay, latitude, longitude) {
  const houses = sweph.houses(julianDay, latitude, longitude, "P"); // Placidus system
  const ascendantLongitude = houses.data.points[0];
  const mcLongitude = houses.data.points[1];

  return {
    ascendant: longitudeToSign(ascendantLongitude),
    midheaven: longitudeToSign(mcLongitude),
  };
}

/**
 * Full birth chart calculation - used once at onboarding completion,
 * result should be cached on the User document (see userController).
 */
function calculateBirthChart({ dateOfBirth, birthTime, isExactTime, latitude, longitude, timezone }) {
  const dateStr = moment(dateOfBirth).format("YYYY-MM-DD");
  const julianDay = toJulianDay(dateStr, isExactTime ? birthTime : "12:00", timezone);

  const planets = calculatePlanetPositions(julianDay);

  let ascendantData = null;
  if (isExactTime && latitude !== undefined && longitude !== undefined) {
    ascendantData = calculateAscendant(julianDay, latitude, longitude);
  }

  return {
    planets,
    ascendant: ascendantData ? ascendantData.ascendant : null,
    midheaven: ascendantData ? ascendantData.midheaven : null,
    sunSign: planets.find((p) => p.key === "sun")?.sign,
    moonSign: planets.find((p) => p.key === "moon")?.sign,
    calculatedAt: new Date(),
  };
}

/**
 * Current transiting planetary positions "for today" - used on Home/
 * Celestial overview screens (not birth-specific).
 */
function calculateCurrentTransits() {
  const now = moment.utc();
  const julianDay = sweph.julday(
    now.year(),
    now.month() + 1,
    now.date(),
    now.hour() + now.minute() / 60,
    sweph.constants.SE_GREG_CAL
  );

  return calculatePlanetPositions(julianDay);
}

/**
 * Moon phase (0-1 illumination fraction + phase name) for a given date
 * (defaults to now). Used on Home + Moon Detail screens.
 */
// function calculateMoonPhase(date = new Date()) {
//   const m = moment.utc(date);
//   const julianDay = sweph.julday(
//     m.year(),
//     m.month() + 1,
//     m.date(),
//     m.hour() + m.minute() / 60,
//     sweph.constants.SE_GREG_CAL
//   );

//   const pheno = sweph.pheno_ut(julianDay, sweph.constants.SE_MOON, FLAG);
//   const illumination = pheno.data[1]; // fraction illuminated, 0-1

//   const sunPos = sweph.calc_ut(julianDay, sweph.constants.SE_SUN, FLAG).data[0];
//   const moonPos = sweph.calc_ut(julianDay, sweph.constants.SE_MOON, FLAG).data[0];
//   let elongation = moonPos - sunPos;
//   if (elongation < 0) elongation += 360;

//   let phaseName;
//   if (elongation < 22.5) phaseName = "New Moon";
//   else if (elongation < 67.5) phaseName = "Waxing Crescent";
//   else if (elongation < 112.5) phaseName = "First Quarter";
//   else if (elongation < 157.5) phaseName = "Waxing Gibbous";
//   else if (elongation < 202.5) phaseName = "Full Moon";
//   else if (elongation < 247.5) phaseName = "Waning Gibbous";
//   else if (elongation < 292.5) phaseName = "Last Quarter";
//   else if (elongation < 337.5) phaseName = "Waning Crescent";
//   else phaseName = "New Moon";

//   const { sign } = longitudeToSign(moonPos);

//   return {
//     phaseName,
//     illuminationPercent: Math.round(illumination * 100),
//     currentSign: sign,
//     date: m.toDate(),
//   };
// }

function calculateMoonPhase(date = new Date(), timezone = "UTC") {
  // Convert date into requested timezone
  const m = moment(date).tz(timezone);

  // Convert to UTC because Swiss Ephemeris works in UT
  const utc = m.clone().utc();

  const julianDay = sweph.julday(
    utc.year(),
    utc.month() + 1,
    utc.date(),
    utc.hour() +
      utc.minute() / 60 +
      utc.second() / 3600,
    sweph.constants.SE_GREG_CAL
  );

  const pheno = sweph.pheno_ut(
    julianDay,
    sweph.constants.SE_MOON,
    FLAG
  );

  const illumination = pheno.data[1];

  const sunLongitude = sweph.calc_ut(
    julianDay,
    sweph.constants.SE_SUN,
    FLAG
  ).data[0];

  const moonLongitude = sweph.calc_ut(
    julianDay,
    sweph.constants.SE_MOON,
    FLAG
  ).data[0];

  let elongation = moonLongitude - sunLongitude;

  if (elongation < 0) {
    elongation += 360;
  }

  let phaseName = "";

  if (elongation < 22.5) phaseName = "New Moon";
  else if (elongation < 67.5) phaseName = "Waxing Crescent";
  else if (elongation < 112.5) phaseName = "First Quarter";
  else if (elongation < 157.5) phaseName = "Waxing Gibbous";
  else if (elongation < 202.5) phaseName = "Full Moon";
  else if (elongation < 247.5) phaseName = "Waning Gibbous";
  else if (elongation < 292.5) phaseName = "Last Quarter";
  else if (elongation < 337.5) phaseName = "Waning Crescent";
  else phaseName = "New Moon";

  const { sign } = longitudeToSign(moonLongitude);

  // Moon age = days since the last New Moon (0 = New Moon, ~14.76 = Full
  // Moon, up to ~29.53 = synodic month length). elongation (0-360deg)
  // maps linearly onto this - used by "Moon Age" text on Moon screens
  // (e.g. "Day 5 of 29").
  const SYNODIC_MONTH_DAYS = 29.530588;
  const moonAgeDays = Number(((elongation / 360) * SYNODIC_MONTH_DAYS).toFixed(1));

  return {
    phaseName,
    illuminationPercent: Number((illumination * 100).toFixed(1)),
    illuminationFraction: illumination,
    currentSign: sign,
    moonLongitude,
    sunLongitude,
    elongation,
    moonAgeDays,
    synodicMonthDays: SYNODIC_MONTH_DAYS,
    calculatedAt: utc.toDate(),
    timezone
  };
}

/**
 * "Upcoming Planets" card on Moon Detail screen - next occurrence of each
 * major moon phase (New Moon, First Quarter, Full Moon, Last Quarter)
 * from a given date. Simple daily-step search over the next ~35 days,
 * matching the elongation degree closest to each phase's target angle.
 */
function getUpcomingMoonPhases(fromDate = new Date(), timezone = "UTC") {
  const targets = [
    { phaseName: "New Moon", targetDeg: 0 },
    { phaseName: "First Quarter", targetDeg: 90 },
    { phaseName: "Full Moon", targetDeg: 180 },
    { phaseName: "Last Quarter", targetDeg: 270 },
  ];

  const samples = [];
  for (let i = 0; i <= 35; i += 1) {
    const d = moment(fromDate).tz(timezone).add(i, "days").toDate();
    const mp = calculateMoonPhase(d, timezone);
    samples.push({ date: d, elongation: mp.elongation });
  }

  const results = targets.map(({ phaseName, targetDeg }) => {
    let best = null;
    let bestDiff = Infinity;
    for (const s of samples) {
      let diff = Math.abs(s.elongation - targetDeg);
      if (targetDeg === 0) diff = Math.min(diff, Math.abs(s.elongation - 360));
      if (diff < bestDiff) {
        bestDiff = diff;
        best = s;
      }
    }
    return { phaseName, date: best ? best.date : null };
  });

  return results.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Celestial Schedule card - moonrise/moonset time for a given date+place.
 * Uses Swiss Ephemeris rise_trans(). Needs geographic coordinates - if the
 * user hasn't set birthInfo.latitude/longitude yet, pass a fallback
 * (e.g. their timezone's rough coordinates) since rise/set is
 * location-dependent and cannot be computed from timezone name alone.
 */
function calculateMoonRiseSet(date = new Date(), latitude, longitude, timezone = "UTC") {
  if (latitude === undefined || longitude === undefined) {
    console.log("[MoonRiseSet] Skipped - latitude/longitude missing on user.birthInfo");
    return { moonrise: null, moonset: null };
  }

  const dateStr = moment(date).tz(timezone).format("YYYY-MM-DD");
  const tjdUt = toJulianDay(dateStr, "00:00", timezone);
  const geopos = [longitude, latitude, 0]; // [lon, lat, altitude meters]

  const format = (result) => {
    // FIX: sweph.rise_trans() returns { flag, error, data } where `data`
    // is a plain Julian Day NUMBER (not an array as first assumed) -
    // confirmed via server logs: {"flag":0,"error":"","data":2461287.23}.
    if (!result || result.data === undefined || result.data === null) return null;
    if (result.error) return null; // sweph reports failure via non-empty error string
    const jd = Array.isArray(result.data) ? result.data[0] : result.data;
    if (typeof jd !== "number") return null;
    const unixMs = (jd - 2440587.5) * 86400000;
    return moment.utc(unixMs).tz(timezone).format("hh:mm A"); // e.g. "11:02 PM"
  };

  let moonrise = null;
  let moonset = null;

  try {
    const riseResult = sweph.rise_trans(
      tjdUt,
      sweph.constants.SE_MOON,
      "",
      FLAG,
      sweph.constants.SE_CALC_RISE,
      geopos,
      1013.25,
      15
    );
    // FIX: silently swallowing errors made this impossible to debug.
    // Log the raw result once so we can see sweph's actual return shape
    // and any serr (error string) it reports.
    console.log("[MoonRiseSet] rise_trans RISE raw result:", JSON.stringify(riseResult));
    moonrise = format(riseResult);
  } catch (e) {
    console.error("[MoonRiseSet] RISE calculation threw:", e.message);
    moonrise = null;
  }

  try {
    const setResult = sweph.rise_trans(
      tjdUt,
      sweph.constants.SE_MOON,
      "",
      FLAG,
      sweph.constants.SE_CALC_SET,
      geopos,
      1013.25,
      15
    );
    console.log("[MoonRiseSet] rise_trans SET raw result:", JSON.stringify(setResult));
    moonset = format(setResult);
  } catch (e) {
    console.error("[MoonRiseSet] SET calculation threw:", e.message);
    moonset = null;
  }

  return { moonrise, moonset };
}

module.exports = {
  toJulianDay,
  calculatePlanetPositions,
  calculateAscendant,
  calculateBirthChart,
  calculateCurrentTransits,
  calculateMoonPhase,
  getUpcomingMoonPhases,
  calculateMoonRiseSet,
};