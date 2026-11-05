const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
const Planet = require("../../models/Planet");
const RitualStep = require("../../models/RitualStep");
const TarotCard = require("../../models/TarotCard");
const BreathingSession = require("../../models/BreathingSession");
/* ===================== MOON PHASE CONTENT (Readings) ===================== */
const ALL_PHASE_NAMES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
];

const flashRedirect = (req, res, type, message, url) => {
  req.flash(type, message);
  req.session.save(() => res.redirect(url));
};

const renderContentView = (req, res, data) =>
  res.render("content_view", {
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
    ...data,
  });

exports.viewRitualStep = async (req, res) => {
  const s = await RitualStep.findById(req.params.id);
  if (!s) return flashRedirect(req, res, "error", "Ritual step not found.", "/admin/content/ritual");

  const fields = [
    { label: "Type", value: s.type },
    { label: "Title", value: s.title },
    { label: "Subtitle", value: s.subtitle },
    { label: "Order", value: s.order },
    { label: "Status", value: s.isActive ? "Active" : "Inactive", badge: s.isActive ? "green" : "red" },
  ];
  if (s.type === "guided_breathing" && s.breathing) {
    fields.push(
      { label: "Inhale (sec)", value: s.breathing.inhaleSeconds },
      { label: "Hold (sec)", value: s.breathing.holdSeconds },
      { label: "Exhale (sec)", value: s.breathing.exhaleSeconds }
    );
  }

  renderContentView(req, res, {
    title: "View Ritual Step",
    heading: s.title,
    image: s.image,
    backUrl: "/admin/content/ritual",
    backLabel: "Ritual Content",
    editUrl: `/admin/content/ritual/edit/${s._id}`,
    fields,
  });
};

exports.viewTarotCard = async (req, res) => {
  const c = await TarotCard.findById(req.params.id);
  if (!c) return flashRedirect(req, res, "error", "Card not found.", "/admin/content/tarot");

  renderContentView(req, res, {
    title: "View Tarot Card",
    heading: c.name,
    image: c.image,
    backUrl: "/admin/content/tarot",
    backLabel: "Tarot Cards",
    editUrl: `/admin/content/tarot/edit/${c._id}`,
    fields: [
      { label: "Name", value: c.name },
      { label: "Arcana", value: c.arcana },
      { label: "Keywords", value: (c.keywords || []).join(", ") },
      { label: "Description", value: c.description },
      { label: "Status", value: c.isActive ? "Active" : "Inactive", badge: c.isActive ? "green" : "red" },
    ],
  });
};

/* ===================== RITUAL CONTENT ===================== */
exports.listRitualSteps = async (req, res) => {
  const steps = await RitualStep.find().sort({ order: 1 });
  res.render("ritual_steps", {
    title: "Ritual Content",
    steps,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.newRitualStepForm = (req, res) => {
  res.render("ritual_step_form", {
    title: "Add Ritual Step",
    step: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

// exports.createRitualStep = async (req, res) => {
//   try {
//     const { type, title, subtitle, order, isActive, inhaleSeconds, holdSeconds, exhaleSeconds } = req.body;

//     await RitualStep.create({
//       type, title, subtitle,
//       order: parseInt(order) || 0,
//       isActive: isActive === "on",
//       breathing: type === "guided_breathing" ? {
//         inhaleSeconds: parseInt(inhaleSeconds) || 4,
//         holdSeconds: parseInt(holdSeconds) || 7,
//         exhaleSeconds: parseInt(exhaleSeconds) || 8,
//       } : undefined,
//     });

//     req.flash("success", "Ritual step added successfully!");
//     res.redirect("/admin/content/ritual");
//   } catch (err) {
//     console.error(err);
//     req.flash("error", "Failed to add ritual step.");
//     res.redirect("/admin/content/ritual/add");
//   }
// };

exports.createRitualStep = async (req, res) => {
  try {
    const { type, title, subtitle, order, isActive, inhaleSeconds, holdSeconds, exhaleSeconds } = req.body;

    await RitualStep.create({
      type, title, subtitle,
      order: parseInt(order) || 0,
      isActive: isActive === "on",
      image: req.file ? `/uploads/ritual/${req.file.filename}` : undefined, // 👈 NEW
      breathing: type === "guided_breathing" ? {
        inhaleSeconds: parseInt(inhaleSeconds) || 4,
        holdSeconds: parseInt(holdSeconds) || 7,
        exhaleSeconds: parseInt(exhaleSeconds) || 8,
      } : undefined,
    });

    req.flash("success", "Ritual step added successfully!");
    res.redirect("/admin/content/ritual");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add ritual step.");
    res.redirect("/admin/content/ritual/add");
  }
};

exports.editRitualStepForm = async (req, res) => {
  const step = await RitualStep.findById(req.params.id);
  if (!step) {
    req.flash("error", "Ritual step not found.");
    return res.redirect("/admin/content/ritual");
  }
  res.render("ritual_step_form", {
    title: "Edit Ritual Step",
    step,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

// exports.updateRitualStep = async (req, res) => {
//   try {
//     const { type, title, subtitle, order, isActive, inhaleSeconds, holdSeconds, exhaleSeconds } = req.body;

//     await RitualStep.findByIdAndUpdate(req.params.id, {
//       type, title, subtitle,
//       order: parseInt(order) || 0,
//       isActive: isActive === "on",
//       breathing: type === "guided_breathing" ? {
//         inhaleSeconds: parseInt(inhaleSeconds) || 4,
//         holdSeconds: parseInt(holdSeconds) || 7,
//         exhaleSeconds: parseInt(exhaleSeconds) || 8,
//       } : undefined,
//     });

//     req.flash("success", "Ritual step updated successfully!");
//     res.redirect("/admin/content/ritual");
//   } catch (err) {
//     console.error(err);
//     req.flash("error", "Failed to update ritual step.");
//     res.redirect(`/admin/content/ritual/edit/${req.params.id}`);
//   }
// };

exports.updateRitualStep = async (req, res) => {
  try {
    const { type, title, subtitle, order, isActive, inhaleSeconds, holdSeconds, exhaleSeconds } = req.body;

    const updateData = {
      type, title, subtitle,
      order: parseInt(order) || 0,
      isActive: isActive === "on",
      breathing: type === "guided_breathing" ? {
        inhaleSeconds: parseInt(inhaleSeconds) || 4,
        holdSeconds: parseInt(holdSeconds) || 7,
        exhaleSeconds: parseInt(exhaleSeconds) || 8,
      } : undefined,
    };
    if (req.file) updateData.image = `/uploads/ritual/${req.file.filename}`; // 👈 NEW - only overwrite if new file uploaded

    await RitualStep.findByIdAndUpdate(req.params.id, updateData);

    req.flash("success", "Ritual step updated successfully!");
    res.redirect("/admin/content/ritual");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update ritual step.");
    res.redirect(`/admin/content/ritual/edit/${req.params.id}`);
  }
};

exports.deleteRitualStep = async (req, res) => {
  await RitualStep.findByIdAndDelete(req.params.id);
  req.flash("success", "Ritual step deleted successfully!");
  res.redirect("/admin/content/ritual");
};



/* ===================== TAROT SETTINGS ===================== */
exports.getTarotSettings = async (req, res) => {
  let settings = await TarotSettings.findOne();
  if (!settings) {
    settings = await TarotSettings.create({ cardsPerDraw: 2 });
  }

  res.render("tarot_settings", {
    title: "Tarot Settings",
    settings,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.updateTarotSettings = async (req, res) => {
  try {
    const cardsPerDraw = Number(req.body.cardsPerDraw) || 2;

    if (cardsPerDraw < 1) {
      req.flash("error", "Cards per day must be at least 1.");
      return res.redirect("/admin/content/tarot/settings");
    }

    let settings = await TarotSettings.findOne();
    if (!settings) {
      settings = await TarotSettings.create({ cardsPerDraw });
    } else {
      settings.cardsPerDraw = cardsPerDraw;
      await settings.save();
    }

    req.flash("success", `Users can now select maximum ${cardsPerDraw} card(s) per day.`);
    res.redirect("/admin/content/tarot/settings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update settings.");
    res.redirect("/admin/content/tarot/settings");
  }
};

/* ===================== TAROT CARDS ===================== */
exports.listTarotCards = async (req, res) => {
  const cards = await TarotCard.find().sort({ arcana: 1, name: 1 });
  res.render("tarot_cards", {
    title: "Tarot Cards",
    cards,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.newTarotCardForm = (req, res) => {
  res.render("tarot_card_form", {
    title: "Add Tarot Card",
    card: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.createTarotCard = async (req, res) => {
  try {
    const { name, arcana, keywords, description, isActive } = req.body;
    await TarotCard.create({
      name, arcana,
      keywords: keywords ? keywords.split(",").map((k) => k.trim()) : [],
      description,
      isActive: isActive === "on",
      image: req.file ? `/uploads/tarot/${req.file.filename}` : undefined,
    });
    req.flash("success", "Tarot card added successfully!");
    res.redirect("/admin/content/tarot");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add tarot card.");
    res.redirect("/admin/content/tarot/add");
  }
};

exports.editTarotCardForm = async (req, res) => {
  const card = await TarotCard.findById(req.params.id);
  if (!card) {
    req.flash("error", "Card not found.");
    return res.redirect("/admin/content/tarot");
  }
  res.render("tarot_card_form", {
    title: "Edit Tarot Card",
    card,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.updateTarotCard = async (req, res) => {
  const { name, arcana, keywords, description, isActive } = req.body;
  const updateData = {
    name, arcana,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()) : [],
    description,
    isActive: isActive === "on",
  };
  if (req.file) updateData.image = `/uploads/tarot/${req.file.filename}`;

  await TarotCard.findByIdAndUpdate(req.params.id, updateData);
  req.flash("success", "Tarot card updated successfully!");
  res.redirect("/admin/content/tarot");
};

exports.deleteTarotCard = async (req, res) => {
  await TarotCard.findByIdAndDelete(req.params.id);
  req.flash("success", "Tarot card deleted successfully!");
  res.redirect("/admin/content/tarot");
};

/* ===================== BREATHING SESSIONS (Cosmic Inhale) ===================== */
exports.listBreathingSessions = async (req, res) => {
  const sessions = await BreathingSession.find().sort({ title: 1 });
  res.render("breathing_sessions", {
    title: "Breathing Sessions (Cosmic Inhale)",
    sessions,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.newBreathingSessionForm = (req, res) => {
  res.render("breathing_session_form", {
    title: "Add Breathing Session",
    session: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

const parseBenefits = (body) => {
  const result = [];
  if (!body.benefitLabel) return result;
  const labels = Array.isArray(body.benefitLabel) ? body.benefitLabel : [body.benefitLabel];
  const icons = Array.isArray(body.benefitIcon) ? body.benefitIcon : [body.benefitIcon];
  const descriptions = Array.isArray(body.benefitDescription)
    ? body.benefitDescription
    : [body.benefitDescription];
  for (let i = 0; i < labels.length; i++) {
    if (labels[i])
      result.push({
        label: labels[i],
        icon: icons[i] || "",
        description: descriptions[i] || "",
      });
  }
  return result;
};

exports.createBreathingSession = async (req, res) => {
  try {
    const {
      title, subtitle, icon, inhaleSeconds, holdSeconds, exhaleSeconds,
      totalCycles, audioType, cyclePhaseKey, isActive,
    } = req.body;
    await BreathingSession.create({
      title, subtitle, icon,
      inhaleSeconds: parseInt(inhaleSeconds) || 4,
      holdSeconds: parseInt(holdSeconds) || 7,
      exhaleSeconds: parseInt(exhaleSeconds) || 8,
      totalCycles: parseInt(totalCycles) || 3,
      audioType: audioType || "Guided + Chimes",
      cyclePhaseKey: cyclePhaseKey || "all",
      benefits: parseBenefits(req.body),
      isActive: isActive === "on" || isActive === "true",
    });
    req.flash("success", "Breathing session added successfully!");
    res.redirect("/admin/content/breathing");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add breathing session.");
    res.redirect("/admin/content/breathing/add");
  }
};

exports.editBreathingSessionForm = async (req, res) => {
  const session = await BreathingSession.findById(req.params.id);
  if (!session) {
    req.flash("error", "Breathing session not found.");
    return res.redirect("/admin/content/breathing");
  }
  res.render("breathing_session_form", {
    title: "Edit Breathing Session",
    session,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.updateBreathingSession = async (req, res) => {
  try {
    const {
      title, subtitle, icon, inhaleSeconds, holdSeconds, exhaleSeconds,
      totalCycles, audioType, cyclePhaseKey, isActive,
    } = req.body;
    await BreathingSession.findByIdAndUpdate(req.params.id, {
      title, subtitle, icon,
      inhaleSeconds: parseInt(inhaleSeconds) || 4,
      holdSeconds: parseInt(holdSeconds) || 7,
      exhaleSeconds: parseInt(exhaleSeconds) || 8,
      totalCycles: parseInt(totalCycles) || 3,
      audioType: audioType || "Guided + Chimes",
      cyclePhaseKey: cyclePhaseKey || "all",
      benefits: parseBenefits(req.body),
      isActive: isActive === "on" || isActive === "true",
    });
    req.flash("success", "Breathing session updated successfully!");
    res.redirect("/admin/content/breathing");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update breathing session.");
    res.redirect(`/admin/content/breathing/edit/${req.params.id}`);
  }
};

exports.deleteBreathingSession = async (req, res) => {
  await BreathingSession.findByIdAndDelete(req.params.id);
  req.flash("success", "Breathing session deleted successfully!");
  res.redirect("/admin/content/breathing");
};



exports.viewBreathingSession = async (req, res) => {
  try {
    const s = await BreathingSession.findById(req.params.id);
    if (!s) return flashRedirect(req, res, "error", "Breathing session not found.", "/admin/content/breathing");

    const benefits = (s.benefits || [])
      .map((b) => `${b.label}${b.description ? " - " + b.description : ""}`)
      .join("\n");

    renderContentView(req, res, {
      title: "View Breathing Session",
      heading: s.title,
      image: s.icon && s.icon.startsWith("/") ? s.icon : null,
      backUrl: "/admin/content/breathing",
      backLabel: "Breathing Sessions",
      editUrl: `/admin/content/breathing/edit/${s._id}`,
      fields: [
        { label: "Title", value: s.title },
        { label: "Subtitle", value: s.subtitle },
        { label: "Icon", value: s.icon && !s.icon.startsWith("/") ? s.icon : "" },
        { label: "Inhale (sec)", value: s.inhaleSeconds },
        { label: "Hold (sec)", value: s.holdSeconds },
        { label: "Exhale (sec)", value: s.exhaleSeconds },
        { label: "Total Cycles", value: s.totalCycles },
        { label: "Audio Type", value: s.audioType },
        { label: "Cycle Phase", value: s.cyclePhaseKey },
        { label: "Benefits", value: benefits },
        { label: "Status", value: s.isActive ? "Active" : "Inactive", badge: s.isActive ? "green" : "red" },
      ],
    });
  } catch (err) {
    console.error(err);
    flashRedirect(req, res, "error", "Something went wrong.", "/admin/content/breathing");
  }
};