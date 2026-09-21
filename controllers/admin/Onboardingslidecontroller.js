const OnboardingSlide = require("../../models/OnboardingSlide");

/* ===================== ONBOARDING / SPLASH SLIDES ===================== */
/* Figma: "Splash screen" + "Onboarding 1/2/3" (Welcome to MEIA) carousel.
   Public app reads these via GET /api/onboarding/slides
   (controllers/user/onboardingController.js -> getSlides).
   This is the admin CRUD that was missing for managing them. */

exports.listSlides = async (req, res) => {
  const slides = await OnboardingSlide.find().sort({ order: 1 });
  res.render("onboarding_slides", {
    title: "Onboarding Slides",
    slides,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.newSlideForm = (req, res) => {
  res.render("onboarding_slide_form", {
    title: "Add Onboarding Slide",
    slide: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.createSlide = async (req, res) => {
  try {
    const { title, description, order, isActive } = req.body;

    await OnboardingSlide.create({
      title,
      description,
      image: req.file ? `/uploads/onboarding/${req.file.filename}` : undefined,
      order: parseInt(order) || 0,
      isActive: isActive === "on",
    });

    req.flash("success", "Onboarding slide added successfully!");
    res.redirect("/admin/onboarding");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message || "Failed to add slide.");
    res.redirect("/admin/onboarding/add");
  }
};

exports.editSlideForm = async (req, res) => {
  const slide = await OnboardingSlide.findById(req.params.id);
  if (!slide) {
    req.flash("error", "Slide not found.");
    return res.redirect("/admin/onboarding");
  }
  res.render("onboarding_slide_form", {
    title: "Edit Onboarding Slide",
    slide,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.updateSlide = async (req, res) => {
  try {
    const { title, description, order, isActive } = req.body;

    const slide = await OnboardingSlide.findById(req.params.id);
    if (!slide) {
      req.flash("error", "Slide not found.");
      return res.redirect("/admin/onboarding");
    }

    slide.title = title;
    slide.description = description;
    slide.order = parseInt(order) || 0;
    slide.isActive = isActive === "on";

    if (req.file) {
      slide.image = `/uploads/onboarding/${req.file.filename}`;
    }

    await slide.save();

    req.flash("success", "Onboarding slide updated successfully!");
    res.redirect("/admin/onboarding");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message || "Failed to update slide.");
    res.redirect(`/admin/onboarding/edit/${req.params.id}`);
  }
};

exports.deleteSlide = async (req, res) => {
  await OnboardingSlide.findByIdAndDelete(req.params.id);
  req.flash("success", "Onboarding slide deleted successfully!");
  res.redirect("/admin/onboarding");
};