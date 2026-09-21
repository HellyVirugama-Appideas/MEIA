const ContactMessage = require("../../models/ContactMessage");
const { success, error } = require("../../utils/response");

const CATEGORIES = ["Bug", "Feedback", "Subscription"];

/* ------------------------------------------------------------------ */
/*  1. GET CATEGORIES -> GET /api/contact-us/categories                */
/*  Figma: "Category" dropdown (Bug, Feedback, Subscription)           */
/*  Public                                                             */
/* ------------------------------------------------------------------ */
exports.getCategories = async (req, res, next) => {
  try {
    return success(res, "Categories fetched successfully.", { categories: CATEGORIES });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. SUBMIT CONTACT FORM -> POST /api/contact-us                     */
/*  Figma: "Contact Us" screen (Title, Description, Street Address,    */
/*  Attach Image, Category) -> "Submitted" success screen              */
/*  (protected, multipart/form-data because of image)                  */
/* ------------------------------------------------------------------ */
exports.submitMessage = async (req, res, next) => {
  try {
    const { title, description, streetAddress, category } = req.body;

    if (!title || !description || !category) {
      return error(res, "Title, description and category are required.", 422);
    }

    if (!CATEGORIES.includes(category)) {
      return error(res, "Please select a valid category.", 422);
    }

    const contactMessage = await ContactMessage.create({
      user: req.user._id,
      title,
      description,
      streetAddress,
      category,
      image: req.file ? `/uploads/contact/${req.file.filename}` : undefined,
    });

    return success(
      res,
      "Your request has been submitted successfully.",
      { contactMessage },
      201
    );
  } catch (err) {
    if (err.message && err.message.includes("Only image files")) {
      return error(res, err.message, 422);
    }
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. GET MY SUBMISSIONS -> GET /api/contact-us/my-requests           */
/*  Lets the user see status of what they've submitted before          */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getMyMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return success(res, "Your requests fetched successfully.", { messages });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  4. GET SINGLE SUBMISSION -> GET /api/contact-us/:id                */
/*  (protected - only the owner can view their own request)            */
/* ------------------------------------------------------------------ */
exports.getMessageById = async (req, res, next) => {
  try {
    const message = await ContactMessage.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!message) {
      return error(res, "Request not found.", 404);
    }

    return success(res, "Request fetched successfully.", { message });
  } catch (err) {
    next(err);
  }
};