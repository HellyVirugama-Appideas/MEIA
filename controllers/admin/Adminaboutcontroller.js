const AboutContent = require("../../models/Aboutcontent");

/* ============================================================
   Helper - parse the Info Cards repeater.
   Fields are indexed (cardTitle_0, cardTitle_1, ...) instead of
   same-name arrays, because each card can also have its own
   uploaded icon file (cardIcon_0, cardIcon_1, ...) and indexed
   names are the only reliable way to match a specific file to a
   specific card when rows can be added/removed out of order.

   `totalCardSlots` (hidden field, updated by the form's JS) tells
   us the upper bound to loop through, since a removed row in the
   middle would otherwise create a gap and stop a plain sequential
   scan too early.
============================================================ */

const parseInfoCards = (body, files) => {
  const result = [];

  const filesByField = {};
  (files || []).forEach((f) => {
    filesByField[f.fieldname] = f;
  });

  const totalSlots = parseInt(body.totalCardSlots, 10) || 0;

  for (let i = 0; i < totalSlots; i++) {
    const title = body[`cardTitle_${i}`];

    if (title) {
      const description = body[`cardDescription_${i}`] || "";

      // Default to whatever was already there; overwrite only if a
      // new file was actually uploaded for this specific card index.
      let icon = body[`cardIconExisting_${i}`] || "";

      const uploadedIcon = filesByField[`cardIcon_${i}`];
      if (uploadedIcon) {
        icon = "/uploads/about/" + uploadedIcon.filename;
      }

      result.push({ icon, title, description });
    }
  }

  return result;
};

/* ============================================================
   SHOW ABOUT FORM -> GET /admin/about
   Singleton page - fetch the one existing record if any.
============================================================ */

exports.showAboutForm = async (req, res) => {
  try {
    const about = await AboutContent.findOne().sort({ createdAt: -1 });

    res.render("about_form", {
      title: "About Page",
      about,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);

    req.flash("error", "Failed to load About page.");

    res.redirect("/admin/dashboard");
  }
};

/* ============================================================
   SAVE ABOUT -> POST /admin/about
   Creates the record if none exists yet, else updates it.

   NOTE: route now uses upload.any() instead of upload.single()
   because file field names are dynamic (heroImage + cardIcon_0,
   cardIcon_1, ...). req.files here is an ARRAY (multer's .any()
   behaviour), not an object keyed by field name.
============================================================ */

exports.saveAbout = async (req, res) => {
  try {
    const files = req.files || [];

    const infoCards = parseInfoCards(req.body, files);

    let about = await AboutContent.findOne().sort({ createdAt: -1 });

    if (!about) {
      about = new AboutContent();
    }

    about.title = req.body.title;
    about.description = req.body.description;
    about.infoCards = infoCards;

    about.ctaSection = {
      title: req.body.ctaTitle || "",
      description: req.body.ctaDescription || "",
      buttonText: req.body.ctaButtonText || "Book A Reading",
    };

    about.isActive = req.body.isActive === "true";

    const heroImageFile = files.find((f) => f.fieldname === "heroImage");
    if (heroImageFile) {
      about.heroImage = "/uploads/about/" + heroImageFile.filename;
    }

    await about.save();

    req.flash("success", "About page saved successfully.");

    res.redirect("/admin/about");
  } catch (err) {
    console.log(err);

    req.flash("error", err.message);

    res.redirect("/admin/about");
  }
};