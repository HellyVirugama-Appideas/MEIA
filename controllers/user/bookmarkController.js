// const SavedItem = require("../../models/SavedItem");
// const DailyReading = require("../../models/Dailyreading");
// const Journal = require("../../models/Journal");
// const { success, error } = require("../../utils/response");

// /* ------------------------------------------------------------------ */
// /* 1. SAVE / UNSAVE Daily Reading  -> POST /api/bookmarks/reading/:id */
// /* ------------------------------------------------------------------ */
// exports.toggleSaveReading = async (req, res, next) => {
//   try {
//     const readingId = req.params.id;
//     const userId = req.user._id;

//     const reading = await DailyReading.findById(readingId);
//     if (!reading) return error(res, "Daily reading not found.", 404);

//     // Unique index sirf user + dailyReading pe hai, isliye type hata diya
//     const existing = await SavedItem.findOne({
//       user: userId,
//       dailyReading: readingId,
//     });

//     if (existing) {
//       await existing.deleteOne();
//       return success(res, "Reading removed from saved.", { saved: false });
//     }

//     await SavedItem.create({
//       user: userId,
//       type: "reading",
//       dailyReading: readingId,
//     });

//     return success(res, "Reading saved successfully.", { saved: true }, 201);
//   } catch (err) {
//     // Duplicate key ko properly handle karo
//     if (err.code === 11000) {
//       return success(res, "Reading already saved.", { saved: true });
//     }
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /* 2. SAVE / UNSAVE Journal Entry  -> POST /api/bookmarks/journal/:id */
// /* ------------------------------------------------------------------ */
// exports.toggleSaveJournal = async (req, res, next) => {
//   try {
//     const journalId = req.params.id;
//     const userId = req.user._id;

//     const journal = await Journal.findOne({ _id: journalId, user: userId });
//     if (!journal) return error(res, "Journal entry not found.", 404);

//     const existing = await SavedItem.findOne({
//       user: userId,
//       type: "journal",
//       journal: journalId,
//     });

//     if (existing) {
//       await existing.deleteOne();
//       return success(res, "Journal removed from saved.", { saved: false });
//     }

//     await SavedItem.create({
//       user: userId,
//       type: "journal",
//       journal: journalId,
//     });

//     return success(res, "Journal saved successfully.", { saved: true }, 201);
//   } catch (err) {
//     next(err);
//   }
// };
// /* ------------------------------------------------------------------ */
// /* 3. LIST SAVED / ARCHIVED  -> GET /api/bookmarks                    */
// /*    Query params:                                                   */
// /*    ?type=all|reading|journal                                       */
// /*    ?search=keyword                                                 */
// /*    ?sort=recent|oldest|a-z|z-a                                     */
// /*    ?page=1&limit=20                                                */
// /* ------------------------------------------------------------------ */
// // exports.listSavedItems = async (req, res, next) => {
// //   try {
// //     const userId = req.user._id;
// //     const {
// //       type = "all",          // all | reading | journal
// //       search = "",
// //       sort = "recent",       // recent | oldest | a-z | z-a
// //       page = 1,
// //       limit = 20,
// //     } = req.query;

// //     const filter = {
// //       user: userId,
// //       isArchived: false,
// //     };

// //     if (type === "reading") filter.type = "reading";
// //     if (type === "journal") filter.type = "journal";

// //     // Populate both
// //     let query = SavedItem.find(filter)
// //       .populate({
// //         path: "dailyReading",
// //         select: "title summary heroImage date readTimeMinutes moonPhase",
// //       })
// //       .populate({
// //         path: "journal",
// //         select: "title content moodTag tags entryDate image",
// //       });

// //     // ---------- SORT ----------
// //     switch (sort) {
// //       case "oldest":
// //         query = query.sort({ createdAt: 1 });          // Oldest Saved
// //         break;
// //       case "a-z":
// //         // Title ke hisaab se sort later in-memory (populate ke baad)
// //         query = query.sort({ createdAt: -1 });
// //         break;
// //       case "z-a":
// //         query = query.sort({ createdAt: -1 });
// //         break;
// //       case "recent":
// //       default:
// //         query = query.sort({ createdAt: -1 });         // Recently Saved
// //         break;
// //     }

// //     const skip = (Number(page) - 1) * Number(limit);
// //     query = query.skip(skip).limit(Number(limit));

// //     const items = await query.lean();

// //     // Format response
// //     let formatted = items
// //       .map((item) => {
// //         if (item.type === "reading" && item.dailyReading) {
// //           return {
// //             id: item._id,
// //             type: "READING",
// //             savedItemId: item._id,
// //             readingId: item.dailyReading._id,
// //             title: item.dailyReading.title || "",
// //             summary: item.dailyReading.summary || "",
// //             date: item.dailyReading.date,
// //             heroImage: item.dailyReading.heroImage,
// //             readTimeMinutes: item.dailyReading.readTimeMinutes,
// //             moonPhase: item.dailyReading.moonPhase,
// //             savedAt: item.createdAt,
// //           };
// //         }

// //         if (item.type === "journal" && item.journal) {
// //           return {
// //             id: item._id,
// //             type: "JOURNAL",
// //             savedItemId: item._id,
// //             journalId: item.journal._id,
// //             title: item.journal.title || "",
// //             summary: item.journal.content
// //               ? item.journal.content.substring(0, 120) + "..."
// //               : "",
// //             date: item.journal.entryDate,
// //             moodTag: item.journal.moodTag,
// //             tags: item.journal.tags || [],
// //             image: item.journal.image,
// //             savedAt: item.createdAt,
// //           };
// //         }

// //         return null;
// //       })
// //       .filter(Boolean);

// //     // ---------- SEARCH ----------
// //     if (search.trim()) {
// //       const q = search.toLowerCase();
// //       formatted = formatted.filter(
// //         (item) =>
// //           item.title?.toLowerCase().includes(q) ||
// //           item.summary?.toLowerCase().includes(q)
// //       );
// //     }

// //     // ---------- A-Z / Z-A SORT (in-memory after populate) ----------
// //     if (sort === "a-z") {
// //       formatted.sort((a, b) =>
// //         (a.title || "").localeCompare(b.title || "", undefined, {
// //           sensitivity: "base",
// //         })
// //       );
// //     } else if (sort === "z-a") {
// //       formatted.sort((a, b) =>
// //         (b.title || "").localeCompare(a.title || "", undefined, {
// //           sensitivity: "base",
// //         })
// //       );
// //     }

// //     const total = formatted.length;

// //     return success(res, "Saved items fetched.", {
// //       items: formatted,
// //       pagination: {
// //         page: Number(page),
// //         limit: Number(limit),
// //         total,
// //         totalPages: Math.ceil(total / Number(limit)) || 1,
// //       },
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// /* ------------------------------------------------------------------ */
// /* 3. LIST SAVED / ARCHIVED  -> GET /api/bookmarks                    */
// /* ------------------------------------------------------------------ */
// exports.listSavedItems = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const {
//       type = "all",
//       search = "",
//       sort = "recent",       // recent | oldest | a-z | z-a
//       page = 1,
//       limit = 20,
//     } = req.query;

//     const filter = {
//       user: userId,
//       isArchived: false,
//     };

//     if (type === "reading") filter.type = "reading";
//     if (type === "journal") filter.type = "journal";

//     // Pehle saara data lao (sort baad me title pe karenge)
//     let query = SavedItem.find(filter)
//       .populate({
//         path: "dailyReading",
//         select: "title summary heroImage date readTimeMinutes moonPhase",
//       })
//       .populate({
//         path: "journal",
//         select: "title content moodTag tags entryDate image",
//       })    
//       .sort({ createdAt: -1 }); // default recent

//     const items = await query.lean();

//     // ---------- Format ----------
//     let formatted = items
//       .map((item) => {
//         if (item.type === "reading" && item.dailyReading) {
//           return {
//             id: item._id,
//             type: "READING",
//             savedItemId: item._id,
//             readingId: item.dailyReading._id,
//             title: item.dailyReading.title || "",
//             summary: item.dailyReading.summary || "",
//             date: item.dailyReading.date,
//             heroImage: item.dailyReading.heroImage,
//             readTimeMinutes: item.dailyReading.readTimeMinutes,
//             moonPhase: item.dailyReading.moonPhase,
//             savedAt: item.createdAt,
//           };
//         }

//         if (item.type === "journal" && item.journal) {
//           return {
//             id: item._id,
//             type: "JOURNAL",
//             savedItemId: item._id,
//             journalId: item.journal._id,
//             title: item.journal.title || "",
//             summary: item.journal.content
//               ? item.journal.content.substring(0, 120) + "..."
//               : "",
//             date: item.journal.entryDate,
//             moodTag: item.journal.moodTag,
//             tags: item.journal.tags || [],
//             image: item.journal.image,
//             savedAt: item.createdAt,
//           };
//         }

//         return null;
//       })
//       .filter(Boolean);

//     // ---------- SEARCH ----------
//     if (search && search.trim()) {
//       const q = search.toLowerCase().trim();
//       formatted = formatted.filter(
//         (item) =>
//           (item.title || "").toLowerCase().includes(q) ||
//           (item.summary || "").toLowerCase().includes(q)
//       );
//     }

//     // ---------- SORT (Title based) ----------
//     switch (sort) {
//       case "oldest":
//         formatted.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));
//         break;

//       case "a-z":
//         formatted.sort((a, b) =>
//           (a.title || "").localeCompare(b.title || "", undefined, {
//             sensitivity: "base",
//             numeric: true,
//           })
//         );
//         break;

//       case "z-a":
//         formatted.sort((a, b) =>
//           (b.title || "").localeCompare(a.title || "", undefined, {
//             sensitivity: "base",
//             numeric: true,
//           })
//         );
//         break;

//       case "recent":
//       default:
//         formatted.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
//         break;
//     }

//     // ---------- Pagination ----------
//     const total = formatted.length;
//     const pageNum = Number(page) || 1;
//     const limitNum = Number(limit) || 20;
//     const startIndex = (pageNum - 1) * limitNum;
//     const paginatedItems = formatted.slice(startIndex, startIndex + limitNum);

//     return success(res, "Saved items fetched.", {
//       items: paginatedItems,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         totalPages: Math.ceil(total / limitNum) || 1,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ------------------------------------------------------------------ */
// /* 4. CHECK IF READING IS SAVED (optional helper)                     */
// /*    GET /api/bookmarks/reading/:id/status                           */
// /* ------------------------------------------------------------------ */
// exports.checkReadingSaved = async (req, res, next) => {
//   try {
//     const exists = await SavedItem.exists({
//       user: req.user._id,
//       type: "reading",
//       dailyReading: req.params.id,
//     });

//     return success(res, "Status fetched.", { saved: !!exists });
//   } catch (err) {
//     next(err);
//   }
// };

const SavedItem = require("../../models/SavedItem");
const DailyReading = require("../../models/Dailyreading");
const WeeklyReading = require("../../models/WeeklyReading");
const Journal = require("../../models/Journal");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/* 1. SAVE / UNSAVE Daily Reading  -> POST /api/bookmarks/reading/:id */
/* ------------------------------------------------------------------ */
exports.toggleSaveReading = async (req, res, next) => {
  try {
    const readingId = req.params.id;
    const userId = req.user._id;

    const reading = await DailyReading.findById(readingId);
    if (!reading) return error(res, "Daily reading not found.", 404);

    // Unique index sirf user + dailyReading pe hai, isliye type hata diya
    const existing = await SavedItem.findOne({
      user: userId,
      dailyReading: readingId,
    });

    if (existing) {
      await existing.deleteOne();
      return success(res, "Reading removed from saved.", { saved: false });
    }

    await SavedItem.create({
      user: userId,
      type: "reading",
      dailyReading: readingId,
    });

    return success(res, "Reading saved successfully.", { saved: true }, 201);
  } catch (err) {
    // Duplicate key ko properly handle karo
    if (err.code === 11000) {
      return success(res, "Reading already saved.", { saved: true });
    }
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* 2. SAVE / UNSAVE Weekly Reading  -> POST /api/bookmarks/weekly/:id */
/*    NEW - was missing entirely, so weekly readings could never be   */
/*    saved/unsaved or show up in the saved list.                     */
/* ------------------------------------------------------------------ */
exports.toggleSaveWeekly = async (req, res, next) => {
  try {
    const weeklyReadingId = req.params.id;
    const userId = req.user._id;

    const reading = await WeeklyReading.findById(weeklyReadingId);
    if (!reading) return error(res, "Weekly reading not found.", 404);

    const existing = await SavedItem.findOne({
      user: userId,
      weeklyReading: weeklyReadingId,
    });

    if (existing) {
      await existing.deleteOne();
      return success(res, "Weekly reading removed from saved.", { saved: false });
    }

    await SavedItem.create({
      user: userId,
      type: "reading",              // ← FIXED: "reading" not "weeklyReading"
      weeklyReading: weeklyReadingId,
    });

    return success(res, "Weekly reading saved successfully.", { saved: true }, 201);
  } catch (err) {
    if (err.code === 11000) {
      return success(res, "Weekly reading already saved.", { saved: true });
    }
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* 3. SAVE / UNSAVE Journal Entry  -> POST /api/bookmarks/journal/:id */
/* ------------------------------------------------------------------ */
exports.toggleSaveJournal = async (req, res, next) => {
  try {
    const journalId = req.params.id;
    const userId = req.user._id;

    const journal = await Journal.findOne({ _id: journalId, user: userId });
    if (!journal) return error(res, "Journal entry not found.", 404);

    const existing = await SavedItem.findOne({
      user: userId,
      type: "journal",
      journal: journalId,
    });

    if (existing) {
      await existing.deleteOne();
      return success(res, "Journal removed from saved.", { saved: false });
    }

    await SavedItem.create({
      user: userId,
      type: "journal",
      journal: journalId,
    });

    return success(res, "Journal saved successfully.", { saved: true }, 201);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* 4. LIST SAVED / ARCHIVED  -> GET /api/bookmarks                    */
/*    Query params:                                                   */
/*    ?type=all|reading|weeklyReading|journal                         */
/*    ?search=keyword                                                 */
/*    ?sort=recent|oldest|a-z|z-a                                     */
/*    ?page=1&limit=20                                                */
/* ------------------------------------------------------------------ */
exports.listSavedItems = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      type = "all",
      search = "",
      sort = "recent",       // recent | oldest | a-z | z-a
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      user: userId,
      isArchived: false,
    };

    if (type === "reading") filter.type = "reading";
    if (type === "weeklyReading") filter.type = "weeklyReading";
    if (type === "journal") filter.type = "journal";

    // Pehle saara data lao (sort baad me title pe karenge)
    let query = SavedItem.find(filter)
      .populate({
        path: "dailyReading",
        select: "title summary heroImage date readTimeMinutes moonPhase",
      })
      .populate({
        path: "weeklyReading",
        select: "title summary heroImage weekStartDate weekEndDate focusArea",
      })
      .populate({
        path: "journal",
        select: "title content moodTag tags entryDate image",
      })
      .sort({ createdAt: -1 }); // default recent

    const items = await query.lean();

    // ---------- Format ----------
    let formatted = items
      .map((item) => {
        if (item.type === "reading" && item.dailyReading) {
          return {
            id: item._id,
            type: "READING",
            readingType: "daily",
            savedItemId: item._id,
            readingId: item.dailyReading._id,
            title: item.dailyReading.title || "",
            summary: item.dailyReading.summary || "",
            date: item.dailyReading.date,
            heroImage: item.dailyReading.heroImage,
            readTimeMinutes: item.dailyReading.readTimeMinutes,
            moonPhase: item.dailyReading.moonPhase,
            savedAt: item.createdAt,
          };
        }

        if (item.type === "reading" && item.weeklyReading) {
          return {
            id: item._id,
            type: "READING",
            readingType: "weekly",
            savedItemId: item._id,
            weeklyReadingId: item.weeklyReading._id,
            title: item.weeklyReading.title || "",
            summary: item.weeklyReading.summary || "",
            weekStartDate: item.weeklyReading.weekStartDate,
            weekEndDate: item.weeklyReading.weekEndDate,
            heroImage: item.weeklyReading.heroImage,
            focusArea: item.weeklyReading.focusArea,
            readTimeMinutes: item.weeklyReading.readTimeMinutes,
            savedAt: item.createdAt,
          };
        }

        if (item.type === "journal" && item.journal) {
          return {
            id: item._id,
            type: "JOURNAL",
            savedItemId: item._id,
            journalId: item.journal._id,
            title: item.journal.title || "",
            summary: item.journal.content
              ? item.journal.content.substring(0, 120) + "..."
              : "",
            date: item.journal.entryDate,
            moodTag: item.journal.moodTag,
            tags: item.journal.tags || [],
            image: item.journal.image,
            savedAt: item.createdAt,
          };
        }

        return null;
      })
      .filter(Boolean);

    // ---------- SEARCH ----------
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      formatted = formatted.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.summary || "").toLowerCase().includes(q)
      );
    }

    // ---------- SORT (Title based) ----------
    switch (sort) {
      case "oldest":
        formatted.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));
        break;

      case "a-z":
        formatted.sort((a, b) =>
          (a.title || "").localeCompare(b.title || "", undefined, {
            sensitivity: "base",
            numeric: true,
          })
        );
        break;

      case "z-a":
        formatted.sort((a, b) =>
          (b.title || "").localeCompare(a.title || "", undefined, {
            sensitivity: "base",
            numeric: true,
          })
        );
        break;

      case "recent":
      default:
        formatted.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        break;
    }

    // ---------- Pagination ----------
    const total = formatted.length;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = formatted.slice(startIndex, startIndex + limitNum);

    return success(res, "Saved items fetched.", {
      items: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* 5. CHECK IF READING IS SAVED (optional helper)                     */
/*    GET /api/bookmarks/reading/:id/status                           */
/* ------------------------------------------------------------------ */
exports.checkReadingSaved = async (req, res, next) => {
  try {
    const exists = await SavedItem.exists({
      user: req.user._id,
      type: "reading",
      dailyReading: req.params.id,
    });

    return success(res, "Status fetched.", { saved: !!exists });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* 6. CHECK IF WEEKLY READING IS SAVED (optional helper)               */
/*    GET /api/bookmarks/weekly/:id/status                            */
/*    NEW - mirrors checkReadingSaved                                 */
/* ------------------------------------------------------------------ */
exports.checkWeeklyReadingSaved = async (req, res, next) => {
  try {
    const exists = await SavedItem.exists({
      user: req.user._id,
      type: "weeklyReading",
      weeklyReading: req.params.id,
    });

    return success(res, "Status fetched.", { saved: !!exists });
  } catch (err) {
    next(err);
  }
};