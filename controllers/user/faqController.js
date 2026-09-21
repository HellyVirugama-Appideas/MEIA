// const mongoose = require("mongoose");
// const Faq = require("../../models/Faq");
// const { success } = require("../../utils/response");

// /* ------------------------------------------------------------------ */
// /* GET FAQs -> GET /api/faqs
// /* ------------------------------------------------------------------ */
// exports.getFaqs = async (req, res, next) => {
//   try {
//     console.log("========== FAQ DEBUG ==========");
//     console.log("Database Name:", mongoose.connection.name);
//     console.log("Collection Name:", Faq.collection.name);

//     // Fetch all FAQs
//     const allFaqs = await Faq.find();

//     console.log("Total FAQs:", allFaqs.length);
//     console.log("All FAQs:", allFaqs);

//     // Fetch only active FAQs
//     const activeFaqs = await Faq.find({ isActive: true }).sort({ order: 1 });

//     console.log("Active FAQs:", activeFaqs.length);
//     console.log(activeFaqs);

//     return success(res, "FAQs fetched successfully.", {
//       faqs: activeFaqs,
//     });
//   } catch (err) {
//     console.error("FAQ Error:", err);
//     next(err);
//   }
// };

const mongoose = require("mongoose");
const Faq = require("../../models/Faq");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/* GET FAQs -> GET /api/faqs
/* ------------------------------------------------------------------ */
exports.getFaqs = async (req, res, next) => {
  try {
    console.log("========== FAQ DEBUG ==========");
    console.log("Database Name:", mongoose.connection.name);
    console.log("Collection Name:", Faq.collection.name);

    // Fetch all FAQs
    const allFaqs = await Faq.find();

    console.log("Total FAQs:", allFaqs.length);
    console.log("All FAQs:", allFaqs);

    // Fetch only active FAQs
    const activeFaqs = await Faq.find({ isActive: true }).sort({ order: 1 });

    console.log("Active FAQs:", activeFaqs.length);
    console.log(activeFaqs);

    return success(res, "FAQs fetched successfully.", {
      faqs: activeFaqs,
    });
  } catch (err) {
    console.error("FAQ Error:", err);
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* SEARCH FAQs -> GET /api/faqs/search?q=keyword                       */
/* NEW - keyword search across question + answer, active FAQs only.    */
/* ------------------------------------------------------------------ */
exports.searchFaqs = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return error(res, "Search keyword (q) is required.", 422);
    }

    const keyword = q.trim();

    // Escape regex special characters so symbols in the search term
    // (., *, +, ?, etc.) don't break the query or throw.
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeKeyword, "i");

    const faqs = await Faq.find({
      isActive: true,
      $or: [{ question: regex }, { answer: regex }],
    }).sort({ order: 1 });

    return success(res, "FAQs searched successfully.", {
      keyword,
      count: faqs.length,
      faqs,
    });
  } catch (err) {
    console.error("FAQ Search Error:", err);
    next(err);
  }
};