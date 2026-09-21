const LegalContent = require("../../models/LegalContent");

/* ------------------------------------------------------------------ */
/*  EDIT TERMS -> GET /admin/cms/term                                  */
/* ------------------------------------------------------------------ */
exports.editTermsForm = async (req, res) => {
  try {
    let terms = await LegalContent.findOne({ type: "terms" });
    if (!terms) {
      terms = { title: "", content: "" };
    }

    res.render("term", {
      title: "Terms & Conditions",
      page: terms,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    res.redirect("/admin");
  }
};

/* ------------------------------------------------------------------ */
/*  UPDATE TERMS -> POST /admin/cms/term                               */
/* ------------------------------------------------------------------ */
exports.updateTerms = async (req, res) => {
  try {
    const { title, content } = req.body;

    await LegalContent.findOneAndUpdate(
      { type: "terms" },
      { type: "terms", title, content },
      { upsert: true, new: true }
    );

    req.flash('success', 'Terms & Conditions updated successfully!');
    res.redirect("/admin/cms/term");
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update Terms & Conditions');
    res.redirect("/admin/cms/term");
  }
};

/* ------------------------------------------------------------------ */
/*  EDIT PRIVACY POLICY -> GET /admin/cms/privacy                      */
/* ------------------------------------------------------------------ */
exports.editPrivacyForm = async (req, res) => {
  try {
    let privacy = await LegalContent.findOne({ type: "privacy_policy" });
    if (!privacy) {
      privacy = { title: "", content: "" };
    }

    res.render("privacy", {
      title: "Privacy Policy",
      page: privacy,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    res.redirect("/admin");
  }
};

/* ------------------------------------------------------------------ */
/*  UPDATE PRIVACY POLICY -> POST /admin/cms/privacy                   */
/* ------------------------------------------------------------------ */
exports.updatePrivacy = async (req, res) => {
  try {
    const { title, content } = req.body;

    await LegalContent.findOneAndUpdate(
      { type: "privacy_policy" },
      { type: "privacy_policy", title, content },
      { upsert: true, new: true }
    );

    req.flash('success', 'Privacy Policy updated successfully!');
    res.redirect("/admin/cms/privacy");
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update Privacy Policy');
    res.redirect("/admin/cms/privacy");
  }
};