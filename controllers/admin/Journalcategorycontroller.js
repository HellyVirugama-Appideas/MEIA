const JournalCategory = require("../../models/Journalcategory");

/* ============================================================
   JOURNAL CATEGORIES -> full CRUD (admin adds freely, not fixed)
============================================================ */

exports.listJournalCategories = async (req, res) => {
  try {
    const categories = await JournalCategory.find().sort({ order: 1, name: 1 });

    res.render("journal_categories", {
      title: "Journal Categories",
      categories,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to fetch journal categories.");
    res.redirect("/admin/dashboard");
  }
};

exports.newJournalCategoryForm = (req, res) => {
  res.render("journal_category_form", {
    title: "Add Journal Category",
    category: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.createJournalCategory = async (req, res) => {
  try {
    const { name, order, isActive } = req.body;

    if (!name || !name.trim()) {
      req.flash("error", "Category name is required.");
      return res.redirect("/admin/journal/add");
    }

    const exists = await JournalCategory.findOne({ name: name.trim() });
    if (exists) {
      req.flash("error", `"${name.trim()}" already exists.`);
      return res.redirect("/admin/journal/add");
    }

    await JournalCategory.create({
      name: name.trim(),
      order: Number(order) || 0,
      isActive: isActive === "true",
    });

    req.flash("success", "Journal category created successfully.");
    res.redirect("/admin/journal");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/journal/add");
  }
};

exports.editJournalCategoryForm = async (req, res) => {
  try {
    const category = await JournalCategory.findById(req.params.id);

    if (!category) {
      req.flash("error", "Journal category not found.");
      return res.redirect("/admin/journal");
    }

    res.render("journal_category_form", {
      title: "Edit Journal Category",
      category,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/journal");
  }
};

exports.updateJournalCategory = async (req, res) => {
  try {
    const category = await JournalCategory.findById(req.params.id);

    if (!category) {
      req.flash("error", "Journal category not found.");
      return res.redirect("/admin/journal");
    }

    category.name = req.body.name?.trim() || category.name;
    category.order = Number(req.body.order) || 0;
    category.isActive = req.body.isActive === "true";

    await category.save();

    req.flash("success", "Journal category updated successfully.");
    res.redirect("/admin/journal");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/admin/journal/edit/" + req.params.id);
  }
};

exports.deleteJournalCategory = async (req, res) => {
  try {
    await JournalCategory.findByIdAndDelete(req.params.id);

    req.flash("success", "Journal category deleted successfully.");
    res.redirect("/admin/journal");
  } catch (err) {
    console.log(err);
    req.flash("error", "Unable to delete journal category.");
    res.redirect("/admin/journal");
  }
};