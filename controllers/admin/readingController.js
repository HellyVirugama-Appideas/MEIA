const DailyReading = require("../../models/Dailyreading");
const WeeklyReading = require("../../models/WeeklyReading");


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

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "");

const listToText = (arr, fn) => (arr || []).map(fn).join("\n");

/* ============================================================
   Helper Functions
============================================================ */

const parseCosmicSelfCheck = (body) => {
  const result = [];

  if (!body.cosmicPrompt) return result;

  const prompts = Array.isArray(body.cosmicPrompt)
    ? body.cosmicPrompt
    : [body.cosmicPrompt];

  const types = Array.isArray(body.cosmicType)
    ? body.cosmicType
    : [body.cosmicType];

  for (let i = 0; i < prompts.length; i++) {
    if (prompts[i]) {
      result.push({
        prompt: prompts[i],
        type: types[i] || "mood",
      });
    }
  }

  return result;
};

const parseMoonGuidance = (body) => {
  const result = [];

  if (!body.guidanceTitle) return result;

  const titles = Array.isArray(body.guidanceTitle)
    ? body.guidanceTitle
    : [body.guidanceTitle];

  const descriptions = Array.isArray(body.guidanceDescription)
    ? body.guidanceDescription
    : [body.guidanceDescription];

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

/* ============================================================
   DAILY READING LIST
============================================================ */

exports.listDaily = async (req, res) => {
  try {
    const readings = await DailyReading.find().sort({
      createdAt: -1,
    });

    res.render("daily_readings", {
      title: "Daily Readings",
      readings,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);

    req.flash("error", "Failed to fetch daily readings.");

    res.redirect("/admin/dashboard");
  }
};

/* ============================================================
   ADD FORM
============================================================ */

exports.newDailyForm = (req, res) => {
  res.render("daily_reading_form", {
    title: "Add Daily Reading",
    reading: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

/* ============================================================
   CREATE DAILY READING
============================================================ */

exports.createDaily = async (req, res) => {
  try {

    const cosmicSelfCheck = parseCosmicSelfCheck(req.body);

    const moonPhaseGuidance = parseMoonGuidance(req.body);

    const reading = new DailyReading({

      date: req.body.date,

      moonPhase: req.body.moonPhase,

      heroImage: req.file
        ? `/uploads/readings/${req.file.filename}`
        : "",

      title: req.body.title,

      summary: req.body.summary,

      content: req.body.content,

      readTimeMinutes:
        Number(req.body.readTimeMinutes) || 3,

      cycleAstralSynergy:
        req.body.cycleAstralSynergy,

      cosmicSelfCareRituals:
        req.body.cosmicSelfCareRituals,

      cosmicSelfCheck,

      moonPhaseGuidance,

      creativeRitual: {

        title: req.body.ritualTitle,

        description:
          req.body.ritualDescription,

        buttonText:
          req.body.buttonText ||
          "Continue Ritual",
      },

      eveningReflectionPrompt:
        req.body.eveningReflectionPrompt,

      estimatedCompletion:
        Number(req.body.estimatedCompletion) || 100,

      isActive:
        req.body.isActive === "true",
    });

    await reading.save();

    req.flash(
      "success",
      "Daily Reading created successfully."
    );

    res.redirect("/admin/readings/daily");

  } catch (err) {

    console.log(err);

    req.flash(
      "error",
      err.message
    );

    res.redirect(
      "/admin/readings/daily/add"
    );
  }
};

exports.viewDaily = async (req, res) => {
  try {
    const r = await DailyReading.findById(req.params.id);
    if (!r) return flashRedirect(req, res, "error", "Reading not found.", "/admin/readings/daily");

    renderContentView(req, res, {
      title: "View Daily Reading",
      heading: r.title || "Daily Reading",
      image: r.heroImage,
      backUrl: "/admin/readings/daily",
      backLabel: "Daily Readings",
      editUrl: `/admin/readings/daily/edit/${r._id}`,
      fields: [
        { label: "Date", value: fmtDate(r.date) },
        { label: "Moon Phase", value: r.moonPhase },
        { label: "Title", value: r.title },
        { label: "Summary", value: r.summary },
        { label: "Content", value: r.content },
        { label: "Read Time", value: r.readTimeMinutes ? r.readTimeMinutes + " min" : "" },
        { label: "Cycle Astral Synergy", value: r.cycleAstralSynergy },
        { label: "Cosmic Self Care Rituals", value: r.cosmicSelfCareRituals },
        { label: "Cosmic Self Check", value: listToText(r.cosmicSelfCheck, (c) => `${c.prompt} (${c.type})`) },
        { label: "Moon Phase Guidance", value: listToText(r.moonPhaseGuidance, (g) => `${g.title}${g.description ? " - " + g.description : ""}`) },
        { label: "Ritual Title", value: r.creativeRitual?.title },
        { label: "Ritual Description", value: r.creativeRitual?.description },
        { label: "Ritual Button", value: r.creativeRitual?.buttonText },
        { label: "Evening Reflection Prompt", value: r.eveningReflectionPrompt },
        { label: "Estimated Completion", value: r.estimatedCompletion != null ? r.estimatedCompletion + "%" : "" },
        { label: "Status", value: r.isActive ? "Active" : "Inactive", badge: r.isActive ? "green" : "red" },
      ],
    });
  } catch (err) {
    console.log(err);
    flashRedirect(req, res, "error", "Something went wrong.", "/admin/readings/daily");
  }
};

exports.viewWeekly = async (req, res) => {
  try {
    const r = await WeeklyReading.findById(req.params.id);
    if (!r) return flashRedirect(req, res, "error", "Reading not found.", "/admin/readings/weekly");

    const fields = [
      { label: "Week Start", value: fmtDate(r.weekStartDate) },
      { label: "Week End", value: fmtDate(r.weekEndDate) },
      { label: "Title", value: r.title },
      { label: "Focus Area", value: r.focusArea },
      { label: "Affirmation", value: r.affirmation },
      { label: "Read Time", value: r.readTimeMinutes ? r.readTimeMinutes + " min" : "" },
      { label: "Summary", value: r.summary },
      { label: "Content", value: r.content },
      { label: "Cycle Astral Synergy", value: r.cycleAstralSynergy },
      { label: "Moon Phase Guidance", value: listToText(r.moonPhaseGuidance, (g) => `${g.title}${g.description ? " - " + g.description : ""}`) },
      { label: "Ritual Title", value: r.creativeRitual?.title },
      { label: "Ritual Description", value: r.creativeRitual?.description },
      { label: "Ritual Button", value: r.creativeRitual?.buttonText },
      { label: "Evening Reflection Prompt", value: r.eveningReflectionPrompt },
      { label: "Status", value: r.isActive ? "Active" : "Inactive", badge: r.isActive ? "green" : "red" },
    ];

    // Model ke baaki saare fields (jo upar list me nahi hain) bhi dikhao
    const known = [
      "_id", "__v", "createdAt", "updatedAt", "heroImage", "weekStartDate", "weekEndDate",
      "title", "focusArea", "affirmation", "readTimeMinutes", "summary", "content",
      "cycleAstralSynergy", "moonPhaseGuidance", "creativeRitual",
      "eveningReflectionPrompt", "isActive",
    ];
    const obj = r.toObject();
    Object.keys(obj).forEach((key) => {
      if (known.includes(key)) return;
      let val = obj[key];
      if (val === null || val === undefined || val === "") return;
      if (typeof val === "boolean") val = val ? "Yes" : "No";
      else if (Array.isArray(val))
        val = val.map((x) => (x && typeof x === "object" ? Object.values(x).filter((v) => typeof v !== "object").join(" - ") : x)).join("\n");
      else if (val instanceof Date) val = fmtDate(val);
      else if (typeof val === "object") val = Object.entries(val).map(([k, v]) => `${k}: ${v}`).join("\n");
      fields.push({
        label: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
        value: String(val),
      });
    });

    renderContentView(req, res, {
      title: "View Weekly Reading",
      heading: r.title || "Weekly Reading",
      image: r.heroImage,
      backUrl: "/admin/readings/weekly",
      backLabel: "Weekly Readings",
      editUrl: `/admin/readings/weekly/edit/${r._id}`,
      fields,
    });
  } catch (err) {
    console.log(err);
    flashRedirect(req, res, "error", "Something went wrong.", "/admin/readings/weekly");
  }
};

/* ============================================================
   EDIT FORM
============================================================ */

exports.editDailyForm = async (req, res) => {

  try {

    const reading =
      await DailyReading.findById(req.params.id);

    if (!reading) {

      req.flash(
        "error",
        "Reading not found."
      );

      return res.redirect(
        "/admin/readings/daily"
      );
    }

    res.render(
      "daily_reading_form",
      {
        title: "Edit Daily Reading",

        reading,

        adminName:
          req.session.admin?.name ||
          "Admin",

        url: req.originalUrl,

        messages: req.flash(),
      }
    );

  } catch (err) {

    console.log(err);

    req.flash(
      "error",
      "Something went wrong."
    );

    res.redirect(
      "/admin/readings/daily"
    );
  }
};

/* ============================================================
   UPDATE DAILY READING
============================================================ */

exports.updateDaily = async (req, res) => {
  try {
    const reading = await DailyReading.findById(req.params.id);

    if (!reading) {
      req.flash("error", "Reading not found.");
      return res.redirect("/admin/readings/daily");
    }

    const cosmicSelfCheck = parseCosmicSelfCheck(req.body);
    const moonPhaseGuidance = parseMoonGuidance(req.body);

    reading.date = req.body.date;
    reading.moonPhase = req.body.moonPhase;
    reading.title = req.body.title;
    reading.summary = req.body.summary;
    reading.content = req.body.content;
    reading.readTimeMinutes =
      Number(req.body.readTimeMinutes) || 3;

    reading.cycleAstralSynergy =
      req.body.cycleAstralSynergy;

    reading.cosmicSelfCareRituals =
      req.body.cosmicSelfCareRituals;

    reading.cosmicSelfCheck = cosmicSelfCheck;

    reading.moonPhaseGuidance =
      moonPhaseGuidance;

    reading.creativeRitual = {
      title: req.body.ritualTitle,
      description: req.body.ritualDescription,
      buttonText:
        req.body.buttonText ||
        "Continue Ritual",
    };

    reading.eveningReflectionPrompt =
      req.body.eveningReflectionPrompt;

    reading.estimatedCompletion =
      Number(req.body.estimatedCompletion) ||
      100;

    reading.isActive =
      req.body.isActive === "true";

    if (req.file) {
      reading.heroImage =
        "/uploads/readings/" +
        req.file.filename;
    }

    await reading.save();

    req.flash(
      "success",
      "Daily Reading updated successfully."
    );

    res.redirect("/admin/readings/daily");
  } catch (err) {
    console.log(err);

    req.flash("error", err.message);

    res.redirect(
      "/admin/readings/daily/edit/" +
      req.params.id
    );
  }
};

/* ============================================================
   DELETE DAILY
============================================================ */

exports.deleteDaily = async (req, res) => {
  try {
    await DailyReading.findByIdAndDelete(
      req.params.id
    );

    req.flash(
      "success",
      "Daily Reading deleted successfully."
    );

    res.redirect("/admin/readings/daily");
  } catch (err) {
    console.log(err);

    req.flash(
      "error",
      "Unable to delete reading."
    );

    res.redirect("/admin/readings/daily");
  }
};

/* ============================================================
   WEEKLY READING LIST
============================================================ */

exports.listWeekly = async (req, res) => {
  try {
    const readings =
      await WeeklyReading.find().sort({
        weekStartDate: -1,
      });

    res.render("weekly_readings", {
      title: "Weekly Readings",
      readings,
      adminName:
        req.session.admin?.name ||
        "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);

    req.flash(
      "error",
      "Unable to fetch weekly readings."
    );

    res.redirect("/admin/dashboard");
  }
};

/* ============================================================
   WEEKLY FORM
============================================================ */

exports.newWeeklyForm = (req, res) => {
  res.render("weekly_reading_form", {
    title: "Add Weekly Reading",
    reading: null,
    adminName:
      req.session.admin?.name ||
      "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

/* ============================================================
   CREATE WEEKLY
============================================================ */

exports.createWeekly = async (req, res) => {
  try {
    const moonPhaseGuidance = parseMoonGuidance(req.body);

    const weekly = new WeeklyReading({
      weekStartDate: req.body.weekStartDate,
      weekEndDate: req.body.weekEndDate,
      title: req.body.title,
      summary: req.body.summary,
      content: req.body.content,
      heroImage: req.file
        ? "/uploads/readings/" + req.file.filename
        : "",
      focusArea: req.body.focusArea,
      affirmation: req.body.affirmation,
      readTimeMinutes: Number(req.body.readTimeMinutes) || 3,
      cycleAstralSynergy: req.body.cycleAstralSynergy,
      moonPhaseGuidance,
      eveningReflectionPrompt: req.body.eveningReflectionPrompt,

      // ✅ ADD THIS
      creativeRitual: {
        title: req.body.ritualTitle || "",
        description: req.body.ritualDescription || "",
        buttonText: req.body.buttonText || "Continue Ritual",
      },

      isActive: req.body.isActive === "true",
    });

    await weekly.save();

    req.flash("success", "Weekly Reading created successfully.");
    res.redirect("/admin/readings/weekly");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/readings/weekly/add");
  }
};

/* ============================================================
   EDIT WEEKLY FORM
============================================================ */

exports.editWeeklyForm = async (
  req,
  res
) => {
  try {
    const reading =
      await WeeklyReading.findById(
        req.params.id
      );

    if (!reading) {
      req.flash(
        "error",
        "Reading not found."
      );

      return res.redirect(
        "/admin/readings/weekly"
      );
    }

    res.render(
      "weekly_reading_form",
      {
        title:
          "Edit Weekly Reading",

        reading,

        adminName:
          req.session.admin?.name ||
          "Admin",

        url: req.originalUrl,

        messages: req.flash(),
      }
    );
  } catch (err) {
    console.log(err);

    req.flash(
      "error",
      "Something went wrong."
    );

    res.redirect(
      "/admin/readings/weekly"
    );
  }
};

/* ============================================================
   UPDATE WEEKLY
============================================================ */

exports.updateWeekly = async (req, res) => {
  try {
    const reading = await WeeklyReading.findById(req.params.id);

    if (!reading) {
      req.flash("error", "Reading not found.");
      return res.redirect("/admin/readings/weekly");
    }

    const moonPhaseGuidance = parseMoonGuidance(req.body);

    reading.weekStartDate = req.body.weekStartDate;
    reading.weekEndDate = req.body.weekEndDate;
    reading.title = req.body.title;
    reading.summary = req.body.summary;
    reading.content = req.body.content;
    reading.focusArea = req.body.focusArea;
    reading.affirmation = req.body.affirmation;
    reading.readTimeMinutes = Number(req.body.readTimeMinutes) || 3;
    reading.cycleAstralSynergy = req.body.cycleAstralSynergy;
    reading.moonPhaseGuidance = moonPhaseGuidance;
    reading.eveningReflectionPrompt = req.body.eveningReflectionPrompt;

    // ✅ ADD THIS
    reading.creativeRitual = {
      title: req.body.ritualTitle || reading.creativeRitual?.title || "",
      description: req.body.ritualDescription || reading.creativeRitual?.description || "",
      buttonText: req.body.buttonText || "Continue Ritual",
    };

    reading.isActive = req.body.isActive === "true";

    if (req.file) {
      reading.heroImage = "/uploads/readings/" + req.file.filename;
    }

    await reading.save();

    req.flash("success", "Weekly Reading updated successfully.");
    res.redirect("/admin/readings/weekly");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/readings/weekly/edit/" + req.params.id);
  }
};

/* ============================================================
   DELETE WEEKLY
============================================================ */

exports.deleteWeekly = async (
  req,
  res
) => {
  try {
    await WeeklyReading.findByIdAndDelete(
      req.params.id
    );

    req.flash(
      "success",
      "Weekly Reading deleted successfully."
    );

    res.redirect(
      "/admin/readings/weekly"
    );
  } catch (err) {
    console.log(err);

    req.flash(
      "error",
      "Unable to delete weekly reading."
    );

    res.redirect(
      "/admin/readings/weekly"
    );
  }
};