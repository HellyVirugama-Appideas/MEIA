const ContactMessage = require("../../models/ContactMessage");

/* ------------------------------------------------------------------ */
/*  LIST CONTACT SUBMISSIONS -> GET /admin/contact                     */
/* ------------------------------------------------------------------ */
exports.listMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .populate("user", "name phone email")
      .sort({ createdAt: -1 });

    res.render("contact", {
      title: "Contact Us Requests",
      messages,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages_flash: req.flash(),
      messages: messages,           // ← Yeh naam change karo agar zaruri ho
      contactMessages: messages,
    });
  } catch (err) {
    console.error(err);
    res.render("contact", {
      title: "Contact Us Requests",
      messages: [],
      adminName: req.session.admin?.name || "Admin",
    });
  }
};

/* ------------------------------------------------------------------ */
/*  VIEW SINGLE SUBMISSION -> GET /admin/contact/:id                   */
/* ------------------------------------------------------------------ */
exports.viewMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id).populate(
      "user",
      "name phone email"
    );

    if (!message) {
      req.flash("error", "Request not found.");
      return res.redirect("/admin/contact");
    }

    res.render("contact_view", {
      title: "View Request",
      message,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages_flash: req.flash(),
    });
  } catch (err) {
    console.error(err);
    res.redirect("/admin/contact");
  }
};

/* ------------------------------------------------------------------ */
/*  UPDATE STATUS -> POST /admin/contact/:id/status                    */
/* ------------------------------------------------------------------ */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await ContactMessage.findByIdAndUpdate(req.params.id, { status });

    req.flash("success", "Status updated successfully!");
    res.redirect(`/admin/contact/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update status.");
    res.redirect(`/admin/contact/${req.params.id}`);
  }
};