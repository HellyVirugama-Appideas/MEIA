const CyclePhaseContent = require("../../models/CyclePhaseContent");
const ElementalStateContent = require("../../models/ElementalStateContent");
const PhysicalSymptomOption = require("../../models/PhysicalSymptomOption");

/* ============================================================
   CYCLE PHASE CONTENT (menstrual / follicular / ovulation / luteal)
   Fixed 4 entries -> list + edit only
============================================================ */

exports.listCyclePhases = async (req, res) => {
  try {
    const phases = await CyclePhaseContent.find().sort({ phaseKey: 1 });

    // Only offer "Add" for phase keys that don't exist yet - the app's
    // cycle calculator (utils/cyclePhaseService.js) only ever looks up
    // these 4 fixed keys, so a 5th/invalid one would never be shown to users.
    const ALL_PHASE_KEYS = ["menstrual", "follicular", "ovulation", "luteal"];
    const existingKeys = phases.map((p) => p.phaseKey);
    const missingKeys = ALL_PHASE_KEYS.filter((k) => !existingKeys.includes(k));

    res.render("cycle_phase_content", {
      title: "Cycle Phase Content",
      phases,
      missingKeys,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch cycle phase content.");
    res.redirect("/admin/dashboard");
  }
};

exports.newCyclePhaseForm = async (req, res) => {
  try {
    const ALL_PHASE_KEYS = ["menstrual", "follicular", "ovulation", "luteal"];
    const existing = await CyclePhaseContent.find().distinct("phaseKey");
    const missingKeys = ALL_PHASE_KEYS.filter((k) => !existing.includes(k));

    if (!missingKeys.length) {
      req.flash("error", "All 4 cycle phases already exist. Edit an existing one instead.");
      return res.redirect("/admin/rhythm/cycle-phases");
    }

    res.render("cycle_phase_content_form", {
      title: "Add Cycle Phase Content",
      phase: null,
      missingKeys,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/rhythm/cycle-phases");
  }
};

exports.createCyclePhase = async (req, res) => {
  try {
    const ALL_PHASE_KEYS = ["menstrual", "follicular", "ovulation", "luteal"];

    if (!ALL_PHASE_KEYS.includes(req.body.phaseKey)) {
      req.flash("error", "Invalid phase key.");
      return res.redirect("/admin/rhythm/cycle-phases/add");
    }

    const exists = await CyclePhaseContent.findOne({ phaseKey: req.body.phaseKey });
    if (exists) {
      req.flash("error", "That phase already exists. Edit it instead.");
      return res.redirect("/admin/rhythm/cycle-phases");
    }

    const phase = new CyclePhaseContent({
      phaseKey: req.body.phaseKey,
      title: req.body.title,
      description: req.body.description,
      tips: req.body.tips
        ? req.body.tips.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      isActive: req.body.isActive === "true",
    });

    if (req.file) {
      phase.image = "/uploads/rhythm/" + req.file.filename;
    }

    await phase.save();

    req.flash("success", "Cycle phase content created successfully.");
    res.redirect("/admin/rhythm/cycle-phases");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/rhythm/cycle-phases/add");
  }
};

exports.editCyclePhaseForm = async (req, res) => {
  try {
    const phase = await CyclePhaseContent.findById(req.params.id);

    if (!phase) {
      req.flash("error", "Phase content not found.");
      return res.redirect("/admin/rhythm/cycle-phases");
    }

    res.render("cycle_phase_content_form", {
      title: "Edit Cycle Phase Content",
      phase,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/rhythm/cycle-phases");
  }
};

exports.updateCyclePhase = async (req, res) => {
  try {
    const phase = await CyclePhaseContent.findById(req.params.id);

    if (!phase) {
      req.flash("error", "Phase content not found.");
      return res.redirect("/admin/rhythm/cycle-phases");
    }

    phase.title = req.body.title;
    phase.description = req.body.description;
    phase.tips = req.body.tips
      ? req.body.tips.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    phase.isActive = req.body.isActive === "true";

    if (req.file) {
      phase.image = "/uploads/rhythm/" + req.file.filename;
    }

    await phase.save();

    req.flash("success", "Cycle phase content updated successfully.");
    res.redirect("/admin/rhythm/cycle-phases");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/rhythm/cycle-phases/edit/" + req.params.id);
  }
};

/* ============================================================
   ELEMENTAL STATE CONTENT (Earth / Water / Fire / Air)
   Fixed 4 entries -> list + edit only
============================================================ */

exports.listElementalStates = async (req, res) => {
  try {
    const elements = await ElementalStateContent.find().sort({ element: 1 });

    res.render("elemental_state_content", {
      title: "Elemental State Content",
      elements,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch elemental state content.");
    res.redirect("/admin/dashboard");
  }
};

exports.editElementalStateForm = async (req, res) => {
  try {
    const element = await ElementalStateContent.findById(req.params.id);

    if (!element) {
      req.flash("error", "Elemental state not found.");
      return res.redirect("/admin/rhythm/elemental-states");
    }

    res.render("elemental_state_content_form", {
      title: "Edit Elemental State Content",
      element,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/rhythm/elemental-states");
  }
};

exports.updateElementalState = async (req, res) => {
  try {
    const element = await ElementalStateContent.findById(req.params.id);

    if (!element) {
      req.flash("error", "Elemental state not found.");
      return res.redirect("/admin/rhythm/elemental-states");
    }

    element.title = req.body.title;
    element.description = req.body.description;
    element.isActive = req.body.isActive === "true";

    if (req.file) {
      element.image = "/uploads/rhythm/" + req.file.filename;
    }

    await element.save();

    req.flash("success", "Elemental state content updated successfully.");
    res.redirect("/admin/rhythm/elemental-states");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/rhythm/elemental-states/edit/" + req.params.id);
  }
};

/* ============================================================
   PHYSICAL SYMPTOM OPTIONS
   Flexible list -> full CRUD
============================================================ */

exports.listSymptomOptions = async (req, res) => {
    try {
        const options = await PhysicalSymptomOption
            .find()
            .sort({ order: 1 });

        res.render("physical_symptom_options", {
            title: "Physical Symptom Options",
            options,
            adminName: req.session.admin?.name || "Admin",
            url: req.originalUrl,
            messages: req.flash(),
        });

    } catch (err) {

        console.log(err);

        req.flash(
            "error",
            "Failed to fetch symptom options."
        );

        res.redirect("/admin/dashboard");
    }
};


exports.newSymptomOptionForm = (req, res) => {

    res.render("physical_symptom_option_form", {
        title: "Add Symptom Option",
        option: null,
        adminName: req.session.admin?.name || "Admin",
        url: req.originalUrl,
        messages: req.flash(),
    });

};



exports.createSymptomOption = async (req, res) => {
    try {

        const option = new PhysicalSymptomOption({
            name: req.body.name,
            order: Number(req.body.order) || 0,
            isActive: req.body.isActive === "true",
        });

        // Image upload
        if (req.file) {
            option.icon = "/uploads/rhythm/" + req.file.filename;
        }

        await option.save();

        req.flash(
            "success",
            "Symptom option created successfully."
        );

        res.redirect(
            "/admin/rhythm/symptom-options"
        );

    } catch (err) {

        console.log("CREATE SYMPTOM OPTION ERROR:", err);

        req.flash(
            "error",
            err.message
        );

        res.redirect(
            "/admin/rhythm/symptom-options"
        );
    }
};

exports.editSymptomOptionForm = async (req, res) => {

    try {

        const option =
            await PhysicalSymptomOption.findById(
                req.params.id
            );

        if (!option) {

            req.flash(
                "error",
                "Symptom option not found."
            );

            return res.redirect(
                "/admin/rhythm/symptom-options"
            );
        }

        res.render(
            "physical_symptom_option_form",
            {
                title: "Edit Symptom Option",
                option,
                adminName:
                    req.session.admin?.name || "Admin",
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
            "/admin/rhythm/symptom-options"
        );
    }
};



exports.updateSymptomOption = async (req, res) => {
    try {

        const option =
            await PhysicalSymptomOption.findById(
                req.params.id
            );

        if (!option) {

            req.flash(
                "error",
                "Symptom option not found."
            );

            return res.redirect(
                "/admin/rhythm/symptom-options"
            );
        }


        option.name = req.body.name;

        option.order =
            Number(req.body.order) || 0;

        option.isActive =
            req.body.isActive === "true";


        // New image selected
        // Only replace old image if new image exists
        if (req.file) {

            option.icon =
                "/uploads/rhythm/" +
                req.file.filename;

        }


        await option.save();


        req.flash(
            "success",
            "Symptom option updated successfully."
        );

        res.redirect(
            "/admin/rhythm/symptom-options"
        );

    } catch (err) {

        console.log("UPDATE SYMPTOM OPTION ERROR:", err);

        req.flash(
            "error",
            err.message
        );

        res.redirect(
            "/admin/rhythm/symptom-options/" +
            req.params.id
        );
    }
};

exports.deleteSymptomOption = async (req, res) => {

    try {

        await PhysicalSymptomOption.findByIdAndDelete(
            req.params.id
        );

        req.flash(
            "success",
            "Symptom option deleted successfully."
        );

        res.redirect(
            "/admin/rhythm/symptom-options"
        );

    } catch (err) {

        console.log(err);

        req.flash(
            "error",
            "Unable to delete symptom option."
        );

        res.redirect(
            "/admin/rhythm/symptom-options"
        );
    }
};
