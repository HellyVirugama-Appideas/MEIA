const BreathingSession = require("../../models/BreathingSession");
const BreathingLog = require("../../models/BreathingLog");
const { calculateMoonPhase } = require("../../utils/Astrologyservice");
const {
  getCurrentCyclePhase,
  PHASE_SHORT_LABEL,
} = require("../../utils/cyclePhaseService");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/*  1. LIST BREATHING SESSIONS -> GET /api/breathing/sessions          */
/*  Figma: "Cosmic Inhale" (teaser/list) screen                         */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.listSessions = async (req, res, next) => {
  try {
    const cycle = getCurrentCyclePhase(req.user);

    // Prefer a session tagged for the user's current cycle phase, keep
    // phase-agnostic ("all") sessions after it so the list is never empty.
    const sessions = await BreathingSession.find({ isActive: true }).sort({
      title: 1,
    });
    const ordered = cycle
      ? [...sessions].sort((a, b) => {
          const aMatch = a.cyclePhaseKey === cycle.phaseKey ? 0 : 1;
          const bMatch = b.cyclePhaseKey === cycle.phaseKey ? 0 : 1;
          return aMatch - bMatch;
        })
      : sessions;

    return success(res, "Breathing sessions fetched.", { sessions: ordered });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. GET SESSION DETAIL -> GET /api/breathing/sessions/:id            */
/*  Figma: "Cosmic Inhale" full detail screen — breathing circle,       */
/*  Cycle 1 of N / time remaining, Moon Phase / Cycle Focus / Duration / */
/*  Audio row, Benefits, Start/Pause/Resume                             */
/*  Nothing here is hardcoded: session config comes from                */
/*  BreathingSession (admin managed), moon phase from live ephemeris    */
/*  calc, cycle focus from the same calculator Home uses.               */
/*  (protected)                                                         */
/* ------------------------------------------------------------------ */
exports.getSessionDetail = async (req, res, next) => {
  try {
    const session = await BreathingSession.findById(req.params.id);
    if (!session || !session.isActive) {
      return error(res, "Breathing session not found.", 404);
    }

    const cycleSeconds =
      (session.inhaleSeconds || 0) +
      (session.holdSeconds || 0) +
      (session.exhaleSeconds || 0);
    const totalDurationSeconds = cycleSeconds * (session.totalCycles || 1);

    const moonPhase = calculateMoonPhase(
      new Date(),
      req.user.timezone || "Asia/Kolkata"
    );
    const cycle = getCurrentCyclePhase(req.user);

    return success(res, "Breathing session fetched.", {
      session: {
        id: session._id,
        title: session.title,
        subtitle: session.subtitle,
        icon: session.icon,
        inhaleSeconds: session.inhaleSeconds,
        holdSeconds: session.holdSeconds,
        exhaleSeconds: session.exhaleSeconds,
        totalCycles: session.totalCycles,
        cycleSeconds,
        // Client uses this as the countdown starting point ("02:14 Remaining")
        totalDurationSeconds,
        audioType: session.audioType,
        benefits: session.benefits,
      },
      // "Moon Phase: Waxing Crescent" row — live, same calc as Home
      moonPhase: moonPhase.phaseName,
      // "Cycle Focus: Bloom" row — same calc as Home's "Your Cycle" card
      cycleFocus: cycle ? PHASE_SHORT_LABEL[cycle.phaseKey] : null,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. LOG COMPLETED SESSION -> POST /api/breathing/sessions/:id/complete */
/*  Figma: "Start Breathing" -> completes cycles -> logged              */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.completeSession = async (req, res, next) => {
  try {
    const session = await BreathingSession.findById(req.params.id);
    if (!session) return error(res, "Breathing session not found.", 404);

    const log = await BreathingLog.create({
      user: req.user._id,
      session: session._id,
    });

    return success(res, "Session logged successfully.", { log }, 201);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  4. SET REMINDER TIME -> PUT /api/breathing/reminder-time            */
/*  Figma: "Time picker" screen ("Set time")                            */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.setReminderTime = async (req, res, next) => {
  try {
    const { time } = req.body; // e.g. "06:20 PM"

    if (!time) return error(res, "Time is required.", 422);

    const user = req.user;
    if (!user.personalization) user.personalization = {};
    user.personalization.ritualReminderTime = time;
    await user.save();

    return success(res, "Reminder time saved.", {
      ritualReminderTime: user.personalization.ritualReminderTime,
    });
  } catch (err) {
    next(err);
  }
};