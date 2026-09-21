const RitualStep = require("../../models/RitualStep");
const RitualCompletion = require("../../models/RitualCompletion");
const { success, error } = require("../../utils/response");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ------------------------------------------------------------------ */
/*  1. GET TODAY'S RITUAL -> GET /api/ritual/today                     */
/*  Figma: "Moonlight Ritual" screen - list of steps + completion state */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
// exports.getTodayRitual = async (req, res, next) => {
//   try {
//     const today = startOfToday();

//     const [steps, completion] = await Promise.all([
//       RitualStep.find({ isActive: true }).sort({ order: 1 }),
//       RitualCompletion.findOne({ user: req.user._id, date: today }),
//     ]);

//     const completedIds = completion ? completion.completedSteps.map((id) => id.toString()) : [];

//     const stepsWithStatus = steps.map((step) => ({
//       ...step.toObject(),
//       isCompleted: completedIds.includes(step._id.toString()),
//     }));

//     return success(res, "Today's ritual fetched.", {
//       steps: stepsWithStatus,
//       isFullyCompleted: completion ? completion.isFullyCompleted : false,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getTodayRitual = async (req, res, next) => {
  try {
    const today = startOfToday();

    const [steps, completion] = await Promise.all([
      RitualStep.find({ isActive: true }).sort({ order: 1 }),
      RitualCompletion.findOne({ user: req.user._id, date: today }),
    ]);

    const completedIds = completion ? completion.completedSteps.map((id) => id.toString()) : [];

    const stepsWithStatus = steps.map((step) => ({
      ...step.toObject(),
      isCompleted: completedIds.includes(step._id.toString()),
    }));

    return success(res, "Today's ritual fetched.", {
      steps: stepsWithStatus,
      isFullyCompleted: completion ? completion.isFullyCompleted : false,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. MARK STEP COMPLETE -> POST /api/ritual/steps/:stepId/complete   */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.completeStep = async (req, res, next) => {
  try {
    const today = startOfToday();
    const { stepId } = req.params;

    const step = await RitualStep.findById(stepId);
    if (!step) return error(res, "Ritual step not found.", 404);

    let completion = await RitualCompletion.findOne({ user: req.user._id, date: today });
    if (!completion) {
      completion = await RitualCompletion.create({
        user: req.user._id,
        date: today,
        completedSteps: [],
      });
    }

    if (!completion.completedSteps.map((id) => id.toString()).includes(stepId)) {
      completion.completedSteps.push(stepId);
    }

    const totalActive = await RitualStep.countDocuments({ isActive: true });
    completion.isFullyCompleted = completion.completedSteps.length >= totalActive;

    await completion.save();

    return success(res, "Step marked complete.", { completion });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. COMPLETE WHOLE RITUAL -> POST /api/ritual/complete              */
/*  Figma: "Complete Ritual" button on the highlighted bottom card     */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.completeRitual = async (req, res, next) => {
  try {
    const today = startOfToday();
    const allStepIds = (await RitualStep.find({ isActive: true }).select("_id")).map((s) => s._id);

    const completion = await RitualCompletion.findOneAndUpdate(
      { user: req.user._id, date: today },
      { completedSteps: allStepIds, isFullyCompleted: true },
      { upsert: true, new: true }
    );

    return success(res, "Ritual completed for today.", { completion });
  } catch (err) {
    next(err);
  }
};