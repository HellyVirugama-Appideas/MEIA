const LegalContent = require("../../models/LegalContent");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/*  1. GET TERMS & CONDITIONS -> GET /api/legal/terms                  */
/*  Public                                                             */
/* ------------------------------------------------------------------ */
exports.getTerms = async (req, res, next) => {
  try {
    const terms = await LegalContent.findOne({ type: "terms" });
    if (!terms) return error(res, "Terms & Conditions not found.", 404);

    return success(res, "Terms & Conditions fetched.", { terms });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. GET PRIVACY POLICY -> GET /api/legal/privacy-policy             */
/*  Public                                                             */
/* ------------------------------------------------------------------ */
exports.getPrivacyPolicy = async (req, res, next) => {
  try {
    const privacyPolicy = await LegalContent.findOne({ type: "privacy_policy" });
    if (!privacyPolicy) return error(res, "Privacy Policy not found.", 404);

    return success(res, "Privacy Policy fetched.", { privacyPolicy });
  } catch (err) {
    next(err);
  }
};