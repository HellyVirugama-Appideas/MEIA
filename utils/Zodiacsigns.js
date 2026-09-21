const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/**
 * Converts an ecliptic longitude (0-360 degrees) into a zodiac sign + degree within sign.
 * @param {number} longitude - ecliptic longitude in degrees
 * @returns {{ sign: string, degree: number, degreeFormatted: string }}
 */
function longitudeToSign(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized - signIndex * 30;

  let wholeDeg = Math.floor(degreeInSign);
  let minutes = Math.round((degreeInSign % 1) * 60);
  if (minutes === 60) {
    minutes = 0;
    wholeDeg += 1;
  }

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Math.round(degreeInSign * 100) / 100,
    degreeFormatted: `${wholeDeg}°${minutes}'`,
  };
}

module.exports = { ZODIAC_SIGNS, longitudeToSign };