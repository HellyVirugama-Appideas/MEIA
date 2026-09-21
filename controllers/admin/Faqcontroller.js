const Faq = require("../../models/Faq")

/* ------------------------------------------------------------------ */
/*  LIST FAQs -> GET /admin/cms/faq                                    */
/* ------------------------------------------------------------------ */
exports.listFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ order: 1, createdAt: -1 });

    res.render("faq", {
      title: "Manage FAQ's",
      faqs: faqs,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    res.render("faq", {
      title: "Manage FAQ's",
      faqs: [],
      adminName: req.session.admin?.name || "Admin"
    });
  }
};

/* ------------------------------------------------------------------ */
/*  NEW FAQ FORM -> GET /admin/cms/faq/add                             */
/* ------------------------------------------------------------------ */
exports.newFaqForm = (req, res) => {
  res.render("faq_add", {
    title: "Add New FAQ",
    faq: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash()
  });
};

/* ------------------------------------------------------------------ */
/*  CREATE FAQ -> POST /admin/cms/faq                                  */
/* ------------------------------------------------------------------ */
exports.createFaq = async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;

    await Faq.create({
      question,
      answer,
      order: parseInt(order) || 0,
      isActive: isActive === "on" || isActive === true,
    });

    req.flash('success', 'FAQ added successfully!');
    res.redirect("/admin/cms/faq");
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add FAQ');
    res.redirect("/admin/cms/faq/add");
  }
};

/* ------------------------------------------------------------------ */
/*  EDIT FAQ FORM -> GET /admin/cms/faq/edit/:id                       */
/* ------------------------------------------------------------------ */
exports.editFaqForm = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      req.flash('error', 'FAQ not found');
      return res.redirect("/admin/cms/faq");
    }

    res.render("faq_edit", {
      title: "Edit FAQ",
      faq: faq,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    res.redirect("/admin/cms/faq");
  }
};

/* ------------------------------------------------------------------ */
/*  UPDATE FAQ -> POST /admin/cms/faq/:id                              */
/* ------------------------------------------------------------------ */
exports.updateFaq = async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;

    await Faq.findByIdAndUpdate(req.params.id, {
      question,
      answer,
      order: parseInt(order) || 0,
      isActive: isActive === "on" || isActive === true,
    });

    req.flash('success', 'FAQ updated successfully!');
    res.redirect("/admin/cms/faq");
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update FAQ');
    res.redirect(`/admin/cms/faq/edit/${req.params.id}`);
  }
};

/* ------------------------------------------------------------------ */
/*  DELETE FAQ -> GET /admin/cms/faq/delete/:id                        */
/* ------------------------------------------------------------------ */
exports.deleteFaq = async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    req.flash('success', 'FAQ deleted successfully!');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete FAQ');
  }
  res.redirect("/admin/cms/faq");
};