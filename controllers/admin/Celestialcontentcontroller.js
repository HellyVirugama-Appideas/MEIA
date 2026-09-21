// const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
// const Planet = require("../../models/Planet");
// const UpcomingMoonEvent = require("../../models/UpcomingMoonEvent");
// const ZodiacSignContent = require("../../models/ZodiacSignContent");
// const BirthChartPersonalityContent = require("../../models/BirthChartPersonalityContent");
// const PoweredByContent = require("../../models/PoweredByContent");

// /* ============================================================
//    MOON PHASE INFO (8 fixed phases) -> list + edit only
// ============================================================ */

// exports.listMoonPhases = async (req, res) => {
//   try {
//     const phases = await MoonPhaseInfo.find().sort({ phaseName: 1 });

//     res.render("moon_phase_info", {
//       title: "Moon Phase Content",
//       phases,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Failed to fetch moon phase content.");
//     res.redirect("/admin/dashboard");
//   }
// };

// exports.editMoonPhaseForm = async (req, res) => {
//   try {
//     const phase = await MoonPhaseInfo.findById(req.params.id);

//     if (!phase) {
//       req.flash("error", "Moon phase content not found.");
//       return res.redirect("/admin/celestial/moon-phases");
//     }

//     res.render("moon_phase_info_form", {
//       title: "Edit Moon Phase Content",
//       phase,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong.");
//     res.redirect("/admin/celestial/moon-phases");
//   }
// };

// // exports.updateMoonPhase = async (req, res) => {
// //   try {
// //     const phase = await MoonPhaseInfo.findById(req.params.id);

// //     if (!phase) {
// //       req.flash("error", "Moon phase content not found.");
// //       return res.redirect("/admin/celestial/moon-phases");
// //     }

// //     phase.keywords = req.body.keywords
// //       ? req.body.keywords.split(",").map((k) => k.trim()).filter(Boolean)
// //       : [];
// //     phase.description = req.body.description;
// //     phase.guideContent = req.body.guideContent;

// //     await phase.save();

// //     req.flash("success", "Moon phase content updated successfully.");
// //     res.redirect("/admin/celestial/moon-phases");
// //   } catch (err) {
// //     console.log(err);
// //     req.flash("error", err.message);
// //     res.redirect("/admin/celestial/moon-phases/edit/" + req.params.id);
// //   }
// // };

// exports.updateMoonPhase = async (req, res) => {
//   try {
//     const phase = await MoonPhaseInfo.findById(req.params.id);

//     if (!phase) {
//       req.flash("error", "Moon phase content not found.");
//       return res.redirect("/admin/celestial/moon-phases");
//     }

//     phase.keywords = req.body.keywords
//       ? req.body.keywords.split(",").map((k) => k.trim()).filter(Boolean)
//       : [];
//     phase.description = req.body.description;
//     phase.guideContent = req.body.guideContent;
//     // NAYA: poetic one-liner quote (e.g. "The moon does not fight...")
//     phase.affirmation = req.body.affirmation;

//     // NAYA: image upload - multer se aayi file, agar user ne PC se koi
//     // naya icon select kiya hai to hi update karo, warna purani wali
//     // image reh jayegi.
//     if (req.file) {
//       phase.image = "/uploads/moon-phases/" + req.file.filename;
//     }

//     await phase.save();

//     req.flash("success", "Moon phase content updated successfully.");
//     res.redirect("/admin/celestial/moon-phases");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/moon-phases/edit/" + req.params.id);
//   }
// };

// /* ============================================================
//    PLANETS -> full CRUD
// ============================================================ */

// exports.listPlanets = async (req, res) => {
//   try {
//     const planets = await Planet.find().sort({ order: 1 });

//     res.render("planets", {
//       title: "Planets",
//       planets,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Failed to fetch planets.");
//     res.redirect("/admin/dashboard");
//   }
// };

// exports.newPlanetForm = (req, res) => {
//   res.render("planet_form", {
//     title: "Add Planet",
//     planet: null,
//     adminName: req.session.admin?.name || "Admin",
//     url: req.originalUrl,
//     messages: req.flash(),
//   });
// };

// exports.createPlanet = async (req, res) => {
//   try {
//     const planet = new Planet({
//       name: req.body.name,
//       title: req.body.title,
//       icon: req.body.icon,
//       essence: req.body.essence,
//       quote: req.body.quote,
//       influenceTitle: req.body.influenceTitle,
//       influenceDescription: req.body.influenceDescription,
//       order: Number(req.body.order) || 0,
//     });

//     await planet.save();

//     req.flash("success", "Planet created successfully.");
//     res.redirect("/admin/celestial/planets");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/planets/add");
//   }
// };

// exports.editPlanetForm = async (req, res) => {
//   try {
//     const planet = await Planet.findById(req.params.id);

//     if (!planet) {
//       req.flash("error", "Planet not found.");
//       return res.redirect("/admin/celestial/planets");
//     }

//     res.render("planet_form", {
//       title: "Edit Planet",
//       planet,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong.");
//     res.redirect("/admin/celestial/planets");
//   }
// };

// exports.updatePlanet = async (req, res) => {
//   try {
//     const planet = await Planet.findById(req.params.id);

//     if (!planet) {
//       req.flash("error", "Planet not found.");
//       return res.redirect("/admin/celestial/planets");
//     }

//     planet.name = req.body.name;
//     planet.title = req.body.title;
//     planet.icon = req.body.icon;
//     planet.essence = req.body.essence;
//     planet.quote = req.body.quote;
//     planet.influenceTitle = req.body.influenceTitle;
//     planet.influenceDescription = req.body.influenceDescription;
//     planet.order = Number(req.body.order) || 0;

//     await planet.save();

//     req.flash("success", "Planet updated successfully.");
//     res.redirect("/admin/celestial/planets");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/planets/edit/" + req.params.id);
//   }
// };

// exports.deletePlanet = async (req, res) => {
//   try {
//     await Planet.findByIdAndDelete(req.params.id);

//     req.flash("success", "Planet deleted successfully.");
//     res.redirect("/admin/celestial/planets");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Unable to delete planet.");
//     res.redirect("/admin/celestial/planets");
//   }
// };

// /* ============================================================
//    UPCOMING MOON EVENTS -> full CRUD
// ============================================================ */

// exports.listMoonEvents = async (req, res) => {
//   try {
//     const events = await UpcomingMoonEvent.find().sort({ date: 1 });

//     res.render("moon_events", {
//       title: "Upcoming Moon Events",
//       events,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Failed to fetch upcoming moon events.");
//     res.redirect("/admin/dashboard");
//   }
// };

// exports.newMoonEventForm = (req, res) => {
//   res.render("moon_event_form", {
//     title: "Add Upcoming Moon Event",
//     event: null,
//     adminName: req.session.admin?.name || "Admin",
//     url: req.originalUrl,
//     messages: req.flash(),
//   });
// };

// exports.createMoonEvent = async (req, res) => {
//   try {
//     const event = new UpcomingMoonEvent({
//       phaseName: req.body.phaseName,
//       subtitle: req.body.subtitle,
//       date: req.body.date,
//       time: req.body.time,
//     });

//     await event.save();

//     req.flash("success", "Moon event created successfully.");
//     res.redirect("/admin/celestial/moon-events");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/moon-events/add");
//   }
// };

// exports.editMoonEventForm = async (req, res) => {
//   try {
//     const event = await UpcomingMoonEvent.findById(req.params.id);

//     if (!event) {
//       req.flash("error", "Moon event not found.");
//       return res.redirect("/admin/celestial/moon-events");
//     }

//     res.render("moon_event_form", {
//       title: "Edit Upcoming Moon Event",
//       event,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong.");
//     res.redirect("/admin/celestial/moon-events");
//   }
// };

// exports.updateMoonEvent = async (req, res) => {
//   try {
//     const event = await UpcomingMoonEvent.findById(req.params.id);

//     if (!event) {
//       req.flash("error", "Moon event not found.");
//       return res.redirect("/admin/celestial/moon-events");
//     }

//     event.phaseName = req.body.phaseName;
//     event.subtitle = req.body.subtitle;
//     event.date = req.body.date;
//     event.time = req.body.time;

//     await event.save();

//     req.flash("success", "Moon event updated successfully.");
//     res.redirect("/admin/celestial/moon-events");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/moon-events/edit/" + req.params.id);
//   }
// };

// exports.deleteMoonEvent = async (req, res) => {
//   try {
//     await UpcomingMoonEvent.findByIdAndDelete(req.params.id);

//     req.flash("success", "Moon event deleted successfully.");
//     res.redirect("/admin/celestial/moon-events");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Unable to delete moon event.");
//     res.redirect("/admin/celestial/moon-events");
//   }
// };

// /* ============================================================
//    ZODIAC SIGN CONTENT (12 fixed signs) -> list + edit only
//    Used for the "Rising Sign" card on the Celestial screen
// ============================================================ */

// exports.listZodiacSigns = async (req, res) => {
//   try {
//     const signs = await ZodiacSignContent.find().sort({ signName: 1 });

//     res.render("zodiac_sign_content", {
//       title: "Zodiac Sign Content",
//       signs,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Failed to fetch zodiac sign content.");
//     res.redirect("/admin/dashboard");
//   }
// };

// exports.editZodiacSignForm = async (req, res) => {
//   try {
//     const sign = await ZodiacSignContent.findById(req.params.id);

//     if (!sign) {
//       req.flash("error", "Zodiac sign content not found.");
//       return res.redirect("/admin/celestial/zodiac-signs");
//     }

//     res.render("zodiac_sign_content_form", {
//       title: "Edit Zodiac Sign Content",
//       sign,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong.");
//     res.redirect("/admin/celestial/zodiac-signs");
//   }
// };

// exports.updateZodiacSign = async (req, res) => {
//   try {
//     const sign = await ZodiacSignContent.findById(req.params.id);

//     if (!sign) {
//       req.flash("error", "Zodiac sign content not found.");
//       return res.redirect("/admin/celestial/zodiac-signs");
//     }

//     sign.icon = req.body.icon || "";
//     sign.description = req.body.description;
//     sign.isActive = req.body.isActive === "true";

//     await sign.save();

//     req.flash("success", "Zodiac sign content updated successfully.");
//     res.redirect("/admin/celestial/zodiac-signs");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/zodiac-signs/edit/" + req.params.id);
//   }
// };

// /* ============================================================
//    BIRTH CHART PERSONALITY CONTENT (12 fixed Sun Signs)
//    Used for "Your Cosmic Personality" text + trait cards
//    (Communication, Career Ambitions, etc.) on Birth Chart screen
// ============================================================ */

// const parseTraits = (body) => {
//   const result = [];

//   if (!body.traitTitle) return result;

//   const titles = Array.isArray(body.traitTitle) ? body.traitTitle : [body.traitTitle];
//   const descriptions = Array.isArray(body.traitDescription)
//     ? body.traitDescription
//     : [body.traitDescription];

//   for (let i = 0; i < titles.length; i++) {
//     if (titles[i]) {
//       result.push({
//         title: titles[i],
//         description: descriptions[i] || "",
//       });
//     }
//   }

//   return result;
// };

// exports.listPersonalityContent = async (req, res) => {
//   try {
//     const items = await BirthChartPersonalityContent.find().sort({ sunSign: 1 });

//     res.render("birth_chart_personality", {
//       title: "Birth Chart Personality Content",
//       items,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Failed to fetch birth chart personality content.");
//     res.redirect("/admin/dashboard");
//   }
// };

// exports.editPersonalityContentForm = async (req, res) => {
//   try {
//     const item = await BirthChartPersonalityContent.findById(req.params.id);

//     if (!item) {
//       req.flash("error", "Content not found.");
//       return res.redirect("/admin/celestial/birth-chart-personality");
//     }

//     res.render("birth_chart_personality_form", {
//       title: "Edit Birth Chart Personality Content",
//       item,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong.");
//     res.redirect("/admin/celestial/birth-chart-personality");
//   }
// };

// exports.updatePersonalityContent = async (req, res) => {
//   try {
//     const item = await BirthChartPersonalityContent.findById(req.params.id);

//     if (!item) {
//       req.flash("error", "Content not found.");
//       return res.redirect("/admin/celestial/birth-chart-personality");
//     }

//     item.personalitySummary = req.body.personalitySummary;
//     item.traits = parseTraits(req.body);
//     item.isActive = req.body.isActive === "true";

//     await item.save();

//     req.flash("success", "Birth chart personality content updated successfully.");
//     res.redirect("/admin/celestial/birth-chart-personality");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/birth-chart-personality/edit/" + req.params.id);
//   }
// };

// /* ============================================================
//    POWERED BY CONTENT (Swiss Ephemeris, Sidereal Astrology, etc.)
//    Flexible ordered list -> full CRUD
// ============================================================ */

// exports.listPoweredBy = async (req, res) => {
//   try {
//     const items = await PoweredByContent.find().sort({ order: 1 });

//     res.render("powered_by_content", {
//       title: "Powered By Content",
//       items,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Failed to fetch powered-by content.");
//     res.redirect("/admin/dashboard");
//   }
// };

// exports.newPoweredByForm = (req, res) => {
//   res.render("powered_by_content_form", {
//     title: "Add Powered By Item",
//     item: null,
//     adminName: req.session.admin?.name || "Admin",
//     url: req.originalUrl,
//     messages: req.flash(),
//   });
// };

// exports.createPoweredBy = async (req, res) => {
//   try {
//     const item = new PoweredByContent({
//       title: req.body.title,
//       description: req.body.description,
//       icon: req.body.icon || "",
//       order: Number(req.body.order) || 0,
//       isActive: req.body.isActive === "true",
//     });

//     await item.save();

//     req.flash("success", "Powered-by item created successfully.");
//     res.redirect("/admin/celestial/powered-by");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/powered-by/add");
//   }
// };

// exports.editPoweredByForm = async (req, res) => {
//   try {
//     const item = await PoweredByContent.findById(req.params.id);

//     if (!item) {
//       req.flash("error", "Powered-by item not found.");
//       return res.redirect("/admin/celestial/powered-by");
//     }

//     res.render("powered_by_content_form", {
//       title: "Edit Powered By Item",
//       item,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong.");
//     res.redirect("/admin/celestial/powered-by");
//   }
// };

// exports.updatePoweredBy = async (req, res) => {
//   try {
//     const item = await PoweredByContent.findById(req.params.id);

//     if (!item) {
//       req.flash("error", "Powered-by item not found.");
//       return res.redirect("/admin/celestial/powered-by");
//     }

//     item.title = req.body.title;
//     item.description = req.body.description;
//     item.icon = req.body.icon || "";
//     item.order = Number(req.body.order) || 0;
//     item.isActive = req.body.isActive === "true";

//     await item.save();

//     req.flash("success", "Powered-by item updated successfully.");
//     res.redirect("/admin/celestial/powered-by");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/powered-by/edit/" + req.params.id);
//   }
// };

// exports.deletePoweredBy = async (req, res) => {
//   try {
//     await PoweredByContent.findByIdAndDelete(req.params.id);

//     req.flash("success", "Powered-by item deleted successfully.");
//     res.redirect("/admin/celestial/powered-by");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Unable to delete powered-by item.");
//     res.redirect("/admin/celestial/powered-by");
//   }
// };

const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
const Planet = require("../../models/Planet");
const UpcomingMoonEvent = require("../../models/UpcomingMoonEvent");
const ZodiacSignContent = require("../../models/ZodiacSignContent");
const BirthChartPersonalityContent = require("../../models/BirthChartPersonalityContent");
const PoweredByContent = require("../../models/PoweredByContent");
/* ============================================================
   MOON PHASE INFO (8 fixed phases) -> list + edit only
============================================================ */

exports.listMoonPhases = async (req, res) => {
  try {
    const phases = await MoonPhaseInfo.find().sort({ phaseName: 1 });

    res.render("moon_phase_info", {
      title: "Moon Phase Content",
      phases,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch moon phase content.");
    res.redirect("/admin/dashboard");
  }
};

exports.editMoonPhaseForm = async (req, res) => {
  try {
    const phase = await MoonPhaseInfo.findById(req.params.id);

    if (!phase) {
      req.flash("error", "Moon phase content not found.");
      return res.redirect("/admin/celestial/moon-phases");
    }

    res.render("moon_phase_info_form", {
      title: "Edit Moon Phase Content",
      phase,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/celestial/moon-phases");
  }
};

exports.updateMoonPhase = async (req, res) => {
  try {
    const phase = await MoonPhaseInfo.findById(req.params.id);

    if (!phase) {
      req.flash("error", "Moon phase content not found.");
      return res.redirect("/admin/celestial/moon-phases");
    }

    phase.keywords = req.body.keywords
      ? req.body.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
    phase.description = req.body.description;
    phase.guideContent = req.body.guideContent;

    await phase.save();

    req.flash("success", "Moon phase content updated successfully.");
    res.redirect("/admin/celestial/moon-phases");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/moon-phases/edit/" + req.params.id);
  }
};

/* ============================================================
   PLANETS -> full CRUD
============================================================ */

// exports.listPlanets = async (req, res) => {
//   try {
//     const planets = await Planet.find().sort({ order: 1 });

//     res.render("planets", {
//       title: "Planets",
//       planets,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Failed to fetch planets.");
//     res.redirect("/admin/dashboard");
//   }
// };

// exports.newPlanetForm = (req, res) => {
//   res.render("planet_form", {
//     title: "Add Planet",
//     planet: null,
//     adminName: req.session.admin?.name || "Admin",
//     url: req.originalUrl,
//     messages: req.flash(),
//   });
// };

// exports.createPlanet = async (req, res) => {
//   try {
//     const planet = new Planet({
//       name: req.body.name,
//       title: req.body.title,
//       icon: req.file ? "/uploads/planets/" + req.file.filename : "",
//       essenceTitle,
//       essence: req.body.essence,
//       quote: req.body.quote,
//       influenceTitle: req.body.influenceTitle,
//       influenceDescription: req.body.influenceDescription,
//       order: Number(req.body.order) || 0,
//     });

//     await planet.save();

//     req.flash("success", "Planet created successfully.");
//     res.redirect("/admin/celestial/planets");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/planets/add");
//   }
// };

// exports.editPlanetForm = async (req, res) => {
//   try {
//     const planet = await Planet.findById(req.params.id);

//     if (!planet) {
//       req.flash("error", "Planet not found.");
//       return res.redirect("/admin/celestial/planets");
//     }

//     res.render("planet_form", {
//       title: "Edit Planet",
//       planet,
//       adminName: req.session.admin?.name || "Admin",
//       url: req.originalUrl,
//       messages: req.flash(),
//     });
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong.");
//     res.redirect("/admin/celestial/planets");
//   }
// };

// exports.updatePlanet = async (req, res) => {
//   try {
//     const planet = await Planet.findById(req.params.id);

//     if (!planet) {
//       req.flash("error", "Planet not found.");
//       return res.redirect("/admin/celestial/planets");
//     }

//     planet.name = req.body.name;
//     planet.title = req.body.title;
//     // NAYA: naya icon select kiya ho tabhi update karo, warna purana rahega.
//     if (req.file) {
//       planet.icon = "/uploads/planets/" + req.file.filename;
//     }
//     planet.essenceTitle = req.body.essenceTitle;
//     planet.essence = req.body.essence;
//     planet.quote = req.body.quote;
//     planet.influenceTitle = req.body.influenceTitle;
//     planet.influenceDescription = req.body.influenceDescription;
//     planet.order = Number(req.body.order) || 0;

//     await planet.save();

//     req.flash("success", "Planet updated successfully.");
//     res.redirect("/admin/celestial/planets");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/admin/celestial/planets/edit/" + req.params.id);
//   }
// };

// exports.deletePlanet = async (req, res) => {
//   try {
//     await Planet.findByIdAndDelete(req.params.id);

//     req.flash("success", "Planet deleted successfully.");
//     res.redirect("/admin/celestial/planets");
//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Unable to delete planet.");
//     res.redirect("/admin/celestial/planets");
//   }
// };

exports.listPlanets = async (req, res) => {
  try {
    const planets = await Planet.find().sort({ order: 1 });

    res.render("planets", {
      title: "Planets",
      planets,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch planets.");
    res.redirect("/admin/dashboard");
  }
};

exports.newPlanetForm = (req, res) => {
  res.render("planet_form", {
    title: "Add Planet",
    planet: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.createPlanet = async (req, res) => {
  try {
    // Helper: comma-separated string → clean array
    const toArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(v => v.trim()).filter(Boolean);
      return val.split(",").map(v => v.trim()).filter(Boolean);
    };

    const planet = new Planet({
      name: req.body.name,
      title: req.body.title,
      icon: req.file ? "/uploads/planets/" + req.file.filename : "",
      essenceTitle: req.body.essenceTitle || "",
      essence: req.body.essence || "",
      quote: req.body.quote || "",
      influenceTitle: req.body.influenceTitle || "",
      influenceDescription: req.body.influenceDescription || "",
      governs: toArray(req.body.governs),
      archetype: toArray(req.body.archetype),
      influenceTags: toArray(req.body.influenceTags),
      order: Number(req.body.order) || 0,
    });

    await planet.save();

    req.flash("success", "Planet created successfully.");
    res.redirect("/admin/celestial/planets");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/planets/add");
  }
};

exports.editPlanetForm = async (req, res) => {
  try {
    const planet = await Planet.findById(req.params.id);

    if (!planet) {
      req.flash("error", "Planet not found.");
      return res.redirect("/admin/celestial/planets");
    }

    res.render("planet_form", {
      title: "Edit Planet",
      planet,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/celestial/planets");
  }
};

exports.updatePlanet = async (req, res) => {
  try {
    const planet = await Planet.findById(req.params.id);

    if (!planet) {
      req.flash("error", "Planet not found.");
      return res.redirect("/admin/celestial/planets");
    }

    const toArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(v => v.trim()).filter(Boolean);
      return val.split(",").map(v => v.trim()).filter(Boolean);
    };

    planet.name = req.body.name;
    planet.title = req.body.title;

    // Naya icon select kiya ho tabhi update karo
    if (req.file) {
      planet.icon = "/uploads/planets/" + req.file.filename;
    }

    planet.essenceTitle = req.body.essenceTitle || "";
    planet.essence = req.body.essence || "";
    planet.quote = req.body.quote || "";
    planet.influenceTitle = req.body.influenceTitle || "";
    planet.influenceDescription = req.body.influenceDescription || "";
    planet.governs = toArray(req.body.governs);
    planet.archetype = toArray(req.body.archetype);
    planet.influenceTags = toArray(req.body.influenceTags);
    planet.order = Number(req.body.order) || 0;

    await planet.save();

    req.flash("success", "Planet updated successfully.");
    res.redirect("/admin/celestial/planets");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/planets/edit/" + req.params.id);
  }
};

exports.deletePlanet = async (req, res) => {
  try {
    await Planet.findByIdAndDelete(req.params.id);

    req.flash("success", "Planet deleted successfully.");
    res.redirect("/admin/celestial/planets");
  } catch (err) {
    console.log(err);
    req.flash("error", "Unable to delete planet.");
    res.redirect("/admin/celestial/planets");
  }
};

/* ============================================================
   UPCOMING MOON EVENTS -> full CRUD
============================================================ */

exports.listMoonEvents = async (req, res) => {
  try {
    const events = await UpcomingMoonEvent.find().sort({ date: 1 });

    res.render("moon_events", {
      title: "Upcoming Moon Events",
      events,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch upcoming moon events.");
    res.redirect("/admin/dashboard");
  }
};

exports.newMoonEventForm = (req, res) => {
  res.render("moon_event_form", {
    title: "Add Upcoming Moon Event",
    event: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.createMoonEvent = async (req, res) => {
  try {
    const event = new UpcomingMoonEvent({
      phaseName: req.body.phaseName,
      subtitle: req.body.subtitle,
      date: req.body.date,
      time: req.body.time,
    });

    await event.save();

    req.flash("success", "Moon event created successfully.");
    res.redirect("/admin/celestial/moon-events");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/moon-events/add");
  }
};

exports.editMoonEventForm = async (req, res) => {
  try {
    const event = await UpcomingMoonEvent.findById(req.params.id);

    if (!event) {
      req.flash("error", "Moon event not found.");
      return res.redirect("/admin/celestial/moon-events");
    }

    res.render("moon_event_form", {
      title: "Edit Upcoming Moon Event",
      event,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/celestial/moon-events");
  }
};

exports.updateMoonEvent = async (req, res) => {
  try {
    const event = await UpcomingMoonEvent.findById(req.params.id);

    if (!event) {
      req.flash("error", "Moon event not found.");
      return res.redirect("/admin/celestial/moon-events");
    }

    event.phaseName = req.body.phaseName;
    event.subtitle = req.body.subtitle;
    event.date = req.body.date;
    event.time = req.body.time;

    await event.save();

    req.flash("success", "Moon event updated successfully.");
    res.redirect("/admin/celestial/moon-events");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/moon-events/edit/" + req.params.id);
  }
};

exports.deleteMoonEvent = async (req, res) => {
  try {
    await UpcomingMoonEvent.findByIdAndDelete(req.params.id);

    req.flash("success", "Moon event deleted successfully.");
    res.redirect("/admin/celestial/moon-events");
  } catch (err) {
    console.log(err);
    req.flash("error", "Unable to delete moon event.");
    res.redirect("/admin/celestial/moon-events");
  }
};

/* ============================================================
   ZODIAC SIGN CONTENT (12 fixed signs) -> list + edit only
   Used for the "Rising Sign" card on the Celestial screen
============================================================ */

const ALL_ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

exports.listZodiacSigns = async (req, res) => {
  try {
    const signs = await ZodiacSignContent.find().sort({ signName: 1 });

    res.render("zodiac_sign_content", {
      title: "Zodiac Sign Content",
      signs,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch zodiac sign content.");
    res.redirect("/admin/dashboard");
  }
};

// NAYA: Add form - already-added signs ko dropdown se hata diya, taaki
// admin galti se duplicate na bana de (signName unique hai).
exports.newZodiacSignForm = async (req, res) => {
  try {
    const existing = await ZodiacSignContent.find().select("signName");
    const existingNames = existing.map((s) => s.signName);
    const availableSigns = ALL_ZODIAC_SIGNS.filter(
      (s) => !existingNames.includes(s)
    );

    res.render("zodiac_sign_content_add_form", {
      title: "Add Zodiac Sign Content",
      availableSigns,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/celestial/zodiac-signs");
  }
};

exports.createZodiacSign = async (req, res) => {
  try {
    const { signName, description, isActive } = req.body;

    if (!signName || !ALL_ZODIAC_SIGNS.includes(signName)) {
      req.flash("error", "Please select a valid zodiac sign.");
      return res.redirect("/admin/celestial/zodiac-signs/add");
    }

    const exists = await ZodiacSignContent.findOne({ signName });
    if (exists) {
      req.flash("error", `${signName} already exists. Please edit it instead.`);
      return res.redirect("/admin/celestial/zodiac-signs");
    }

    await ZodiacSignContent.create({
      signName,
      // NAYA: icon ab multer se upload hone wali file hai (image), text
      // URL nahi. req.file.filename multer ne generate kiya hai.
      icon: req.file ? "/uploads/zodiac-signs/" + req.file.filename : "",
      description,
      isActive: isActive === "true",
    });

    req.flash("success", `${signName} content created successfully.`);
    res.redirect("/admin/celestial/zodiac-signs");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/zodiac-signs/add");
  }
};

exports.editZodiacSignForm = async (req, res) => {
  try {
    const sign = await ZodiacSignContent.findById(req.params.id);

    if (!sign) {
      req.flash("error", "Zodiac sign content not found.");
      return res.redirect("/admin/celestial/zodiac-signs");
    }

    res.render("zodiac_sign_content_form", {
      title: "Edit Zodiac Sign Content",
      sign,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/celestial/zodiac-signs");
  }
};

exports.updateZodiacSign = async (req, res) => {
  try {
    const sign = await ZodiacSignContent.findById(req.params.id);

    if (!sign) {
      req.flash("error", "Zodiac sign content not found.");
      return res.redirect("/admin/celestial/zodiac-signs");
    }

    // NAYA: agar admin ne naya icon select kiya hai to hi update karo,
    // warna purani wali image reh jayegi.
    if (req.file) {
      sign.icon = "/uploads/zodiac-signs/" + req.file.filename;
    }

    sign.description = req.body.description;
    sign.isActive = req.body.isActive === "true";

    await sign.save();

    req.flash("success", "Zodiac sign content updated successfully.");
    res.redirect("/admin/celestial/zodiac-signs");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/zodiac-signs/edit/" + req.params.id);
  }
};

/* ============================================================
   BIRTH CHART PERSONALITY CONTENT (12 fixed Sun Signs)
   Used for "Your Cosmic Personality" text + trait cards
   (Communication, Career Ambitions, etc.) on Birth Chart screen
============================================================ */


/* ===========================================================
   BIRTH CHART PERSONALITY CONTENT (12 fixed Sun Signs)
   "Your Cosmic Personality" summary + Strengths/Growth Areas/
   Cosmic Gift cards on Birth Chart screen
============================================================ */

const parseTraits = (body) => {
  const result = [];

  if (!body.traitTitle) return result;

  const titles = Array.isArray(body.traitTitle) ? body.traitTitle : [body.traitTitle];
  const descriptions = Array.isArray(body.traitDescription)
    ? body.traitDescription
    : [body.traitDescription];

  for (let i = 0; i < titles.length; i++) {
    if (titles[i]) {
      result.push({
        title: titles[i],
        description: descriptions[i] || "",
      });
    }
  }

  return result;
};

const ALL_SUN_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// comma-separated textarea -> clean string array (Strengths/Growth Areas)
const parseList = (raw) =>
  raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];

exports.listPersonalityContent = async (req, res) => {
  try {
    const items = await BirthChartPersonalityContent.find().sort({ sunSign: 1 });

    res.render("birth_chart_personality", {
      title: "Birth Chart Personality Content",
      items,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch birth chart personality content.");
    res.redirect("/admin/dashboard");
  }
};

// NAYA: Add form - already-added sun signs dropdown se hata diya, taaki
// admin duplicate na bana de (sunSign unique hai).
exports.newPersonalityContentForm = async (req, res) => {
  try {
    const existing = await BirthChartPersonalityContent.find().select("sunSign");
    const existingNames = existing.map((s) => s.sunSign);
    const availableSigns = ALL_SUN_SIGNS.filter((s) => !existingNames.includes(s));

    res.render("birth_chart_personality_add_form", {
      title: "Add Birth Chart Personality Content",
      availableSigns,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/celestial/birth-chart-personality");
  }
};

exports.createPersonalityContent = async (req, res) => {
  try {
    const { sunSign, personalitySummary, strengths, growthAreas, cosmicGift, isActive } =
      req.body;

    if (!sunSign || !ALL_SUN_SIGNS.includes(sunSign)) {
      req.flash("error", "Please select a valid sun sign.");
      return res.redirect("/admin/celestial/birth-chart-personality/add");
    }

    const exists = await BirthChartPersonalityContent.findOne({ sunSign });
    if (exists) {
      req.flash("error", `${sunSign} already exists. Please edit it instead.`);
      return res.redirect("/admin/celestial/birth-chart-personality");
    }

    await BirthChartPersonalityContent.create({
      sunSign,
      personalitySummary,
      strengths: parseList(strengths),
      growthAreas: parseList(growthAreas),
      cosmicGift,
      isActive: isActive === "true",
    });

    req.flash("success", `${sunSign} content created successfully.`);
    res.redirect("/admin/celestial/birth-chart-personality");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/birth-chart-personality/add");
  }
};

exports.editPersonalityContentForm = async (req, res) => {
  try {
    const item = await BirthChartPersonalityContent.findById(req.params.id);

    if (!item) {
      req.flash("error", "Content not found.");
      return res.redirect("/admin/celestial/birth-chart-personality");
    }

    res.render("birth_chart_personality_form", {
      title: "Edit Birth Chart Personality Content",
      item,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/celestial/birth-chart-personality");
  }
};

exports.updatePersonalityContent = async (req, res) => {
  try {
    const item = await BirthChartPersonalityContent.findById(req.params.id);

    if (!item) {
      req.flash("error", "Content not found.");
      return res.redirect("/admin/celestial/birth-chart-personality");
    }

    item.personalitySummary = req.body.personalitySummary;
    item.strengths = parseList(req.body.strengths);
    item.growthAreas = parseList(req.body.growthAreas);
    item.cosmicGift = req.body.cosmicGift;
    item.isActive = req.body.isActive === "true";

    await item.save();

    req.flash("success", "Birth chart personality content updated successfully.");
    res.redirect("/admin/celestial/birth-chart-personality");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/birth-chart-personality/edit/" + req.params.id);
  }
};

/* ============================================================
   POWERED BY CONTENT (Swiss Ephemeris, Sidereal Astrology, etc.)
   Flexible ordered list -> full CRUD
============================================================ */

exports.listPoweredBy = async (req, res) => {
  try {
    const items = await PoweredByContent.find().sort({ order: 1 });

    res.render("powered_by_content", {
      title: "Powered By Content",
      items,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch powered-by content.");
    res.redirect("/admin/dashboard");
  }
};

exports.newPoweredByForm = (req, res) => {
  res.render("powered_by_content_form", {
    title: "Add Powered By Item",
    item: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.createPoweredBy = async (req, res) => {
  try {
    const item = new PoweredByContent({
      title: req.body.title,
      description: req.body.description,
      icon: req.body.icon || "",
      order: Number(req.body.order) || 0,
      isActive: req.body.isActive === "true",
    });

    await item.save();

    req.flash("success", "Powered-by item created successfully.");
    res.redirect("/admin/celestial/powered-by");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/powered-by/add");
  }
};

exports.editPoweredByForm = async (req, res) => {
  try {
    const item = await PoweredByContent.findById(req.params.id);

    if (!item) {
      req.flash("error", "Powered-by item not found.");
      return res.redirect("/admin/celestial/powered-by");
    }

    res.render("powered_by_content_form", {
      title: "Edit Powered By Item",
      item,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/celestial/powered-by");
  }
};

exports.updatePoweredBy = async (req, res) => {
  try {
    const item = await PoweredByContent.findById(req.params.id);

    if (!item) {
      req.flash("error", "Powered-by item not found.");
      return res.redirect("/admin/celestial/powered-by");
    }

    item.title = req.body.title;
    item.description = req.body.description;
    item.icon = req.body.icon || "";
    item.order = Number(req.body.order) || 0;
    item.isActive = req.body.isActive === "true";

    await item.save();

    req.flash("success", "Powered-by item updated successfully.");
    res.redirect("/admin/celestial/powered-by");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/celestial/powered-by/edit/" + req.params.id);
  }
};

exports.deletePoweredBy = async (req, res) => {
  try {
    await PoweredByContent.findByIdAndDelete(req.params.id);

    req.flash("success", "Powered-by item deleted successfully.");
    res.redirect("/admin/celestial/powered-by");
  } catch (err) {
    console.log(err);
    req.flash("error", "Unable to delete powered-by item.");
    res.redirect("/admin/celestial/powered-by");
  }
};