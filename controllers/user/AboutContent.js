const AboutContent = require("../../models/Aboutcontent");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/* GET /api/about  -> public/protected app-facing endpoint             */
/* Returns the active About page content for the "About" screen.      */
/* ------------------------------------------------------------------ */
exports.getAbout = async (req, res, next) => {
  try {
    const about = await AboutContent.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    if (!about) {
      return error(res, "About content not available yet.", 404);
    }

    return success(res, "About content fetched.", {
      heroImage: about.heroImage,
      title: about.title,
      description: about.description,
      infoCards: about.infoCards || [],
      ctaSection: about.ctaSection || null,
    });
  } catch (err) {
    next(err);
  }
};