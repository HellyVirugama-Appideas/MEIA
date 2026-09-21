const axios = require("axios");
const geoTz = require("geo-tz");

/**
 * Converts a free-text place name (e.g. "Ahmedabad, India") into
 * { latitude, longitude, timezone }.
 * Uses OpenStreetMap Nominatim (free, no API key needed).
 */
const geocodePlace = async (placeName) => {
  if (!placeName) {
    throw new Error("Birth place is required for geocoding.");
  }

  const response = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: placeName,
      format: "json",
      limit: 1,
    },
    headers: {
      "User-Agent": "MEIA-App/1.0 (contact: support@meia.app)",
    },
    timeout: 8000,
  });

  if (!response.data || response.data.length === 0) {
    throw new Error(`Could not find location for "${placeName}". Please enter a more specific place.`);
  }

  const { lat, lon } = response.data[0];
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  const timezones = geoTz.find(latitude, longitude);
  const timezone = timezones[0] || "UTC";

  return { latitude, longitude, timezone };
};

module.exports = { geocodePlace };
