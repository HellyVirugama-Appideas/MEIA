const DailyReading = require("../../models/Dailyreading");
const WeeklyReading = require("../../models/WeeklyReading");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/*  GET TODAY'S READING -> GET /api/daily-reading/today                */
/*  Figma: "Daily reading" full detail screen                          */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getTodayReading = async (req, res, next) => {
  try {
    // isActive filter added so this matches the same rule Home uses -
    // an inactive/draft reading should never surface here either.
    const reading = await DailyReading.findOne({
      date: { $lte: new Date() },
      isActive: true,
    }).sort({ date: -1 });

    if (!reading) {
      return error(res, "No reading available yet.", 404);
    }

    return success(res, "Daily reading fetched.", { reading });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  GET WEEKLY READING -> GET /api/daily-reading/weekly                */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getWeeklyReading = async (req, res, next) => {
  try {
    const reading = await WeeklyReading.findOne({
      weekStartDate: { $lte: new Date() },
      isActive: true,
    }).sort({
      weekStartDate: -1,
    });

    if (!reading) {
      return error(res, "No weekly reading available yet.", 404);
    }

    return success(res, "Weekly reading fetched.", { reading });
  } catch (err) {
    next(err);
  }
};