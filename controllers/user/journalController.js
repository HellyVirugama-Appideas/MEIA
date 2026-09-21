const Journal = require("../../models/Journal");
const RitualStep = require("../../models/RitualStep");
const RitualCompletion = require("../../models/RitualCompletion");
const JournalCategory = require("../../models/JournalCategory");
const { success, error } = require("../../utils/response");
const SavedItem = require("../../models/SavedItem"); // path adjust kar lena


const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Comma-separated string ("Manifestation, Growth") -> clean array. Frontend
// sends this way kyunki multipart/form-data (image upload ke liye) me raw
// JSON arrays bhejna reliable nahi hota.
const parseTags = (raw) => {
  if (Array.isArray(raw)) return raw.map((t) => t.trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
};

// NAYA: Moonlight Ritual ke cards is hi Journal screen pe redirect hote
// hain. Entry save hote hi, agar ritualStepId diya gaya ho, us step ko
// aaj ke RitualCompletion me automatically "complete" mark kar dete hain.
const markRitualStepComplete = async (userId, stepId) => {
  if (!stepId) return;

  const step = await RitualStep.findById(stepId);
  if (!step) return;

  const today = startOfToday();
  let completion = await RitualCompletion.findOne({ user: userId, date: today });
  if (!completion) {
    completion = await RitualCompletion.create({ user: userId, date: today, completedSteps: [] });
  }

  if (!completion.completedSteps.map((id) => id.toString()).includes(stepId.toString())) {
    completion.completedSteps.push(stepId);
  }

  const totalActive = await RitualStep.countDocuments({ isActive: true });
  completion.isFullyCompleted = completion.completedSteps.length >= totalActive;

  await completion.save();
};

/* ------------------------------------------------------------------ */
/*  1. LIST JOURNAL ENTRIES -> GET /api/journal                        */
/*  Figma: "Journal History" screen                                     */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.listJournalEntries = async (req, res, next) => {
  try {
    const entries = await Journal.find({ user: req.user._id })
      .sort({ entryDate: -1 })
      .lean();

    // SavedItem se user ke bookmarked journal IDs nikaalo
    const savedItems = await SavedItem.find({
      user: req.user._id,
      type: "journal",
      isArchived: false,
    }).select("journal");

    const savedIds = new Set(
      savedItems.map((item) => item.journal?.toString())
    );

    const entriesWithSaved = entries.map((entry) => ({
      ...entry,
      isSaved: savedIds.has(entry._id.toString()),
    }));

    return success(res, "Journal entries fetched.", { entries: entriesWithSaved });
  } catch (err) {
    next(err);
  }
};
/* ------------------------------------------------------------------ */
/*  2. GET OPTIONS -> GET /api/journal/options                         */
/*  Figma: "Edit Journal" screen -> "Category" dropdown (admin-managed) */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getJournalOptions = async (req, res, next) => {
  try {
    const categories = await JournalCategory.find({ isActive: true }).sort({
      order: 1,
      name: 1,
    });

    return success(res, "Journal options fetched.", {
      categories: categories.map((c) => c.name),
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. CREATE ENTRY -> POST /api/journal                                */
/*  Figma: "Edit Journal" / "Moonlight-gratitude" screens                */
/*  Fields: title, content, tags, image, category (admin-managed)       */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.createJournalEntry = async (req, res, next) => {
  try {
    const { title, content, tags, category, ritualStepId } = req.body;

    if (!title || !content) {
      return error(res, "Title and content are required.", 422);
    }

    // NAYA: category ab admin-managed JournalCategory list se hi valid
    // honi chahiye - free text nahi, dropdown se select hoti hai.
    if (category) {
      const validCategory = await JournalCategory.findOne({
        name: category,
        isActive: true,
      });
      if (!validCategory) {
        return error(res, "Please select a valid category.", 422);
      }
    }

    const entry = await Journal.create({
      user: req.user._id,
      title,
      content,
      celestialContext: category,
      tags: parseTags(tags),
      ritualStep: ritualStepId || undefined,
      entryDate: new Date(),
      image: req.file ? `/uploads/journal/${req.file.filename}` : undefined,
    });

    if (ritualStepId) {
      await markRitualStepComplete(req.user._id, ritualStepId);
    }

    return success(res, "Journal entry saved.", { entry }, 201);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  4. GET SINGLE ENTRY -> GET /api/journal/:id                        */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getJournalEntry = async (req, res, next) => {
  try {
    const entry = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return error(res, "Journal entry not found.", 404);

    return success(res, "Journal entry fetched.", { entry });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  5. UPDATE ENTRY -> PUT /api/journal/:id                             */
/*  Figma: "Edit Journal" screen -> "Save Entry" button                 */
/*  Fields: title, content, tags, image, category (admin-managed)       */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.updateJournalEntry = async (req, res, next) => {
  try {
    const entry = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return error(res, "Journal entry not found.", 404);

    const { title, content, tags, category, ritualStepId } = req.body;

    if (category) {
      const validCategory = await JournalCategory.findOne({
        name: category,
        isActive: true,
      });
      if (!validCategory) {
        return error(res, "Please select a valid category.", 422);
      }
      entry.celestialContext = category;
    }

    if (title !== undefined) entry.title = title;
    if (content !== undefined) entry.content = content;
    if (tags !== undefined) entry.tags = parseTags(tags);
    if (ritualStepId !== undefined) entry.ritualStep = ritualStepId || undefined;
    if (req.file) entry.image = `/uploads/journal/${req.file.filename}`;

    await entry.save();

    if (ritualStepId) {
      await markRitualStepComplete(req.user._id, ritualStepId);
    }

    return success(res, "Journal entry updated.", { entry });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  6. DELETE ENTRY -> DELETE /api/journal/:id                          */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.deleteJournalEntry = async (req, res, next) => {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return error(res, "Journal entry not found.", 404);

    return success(res, "Journal entry deleted.");
  } catch (err) {
    next(err);
  }
};