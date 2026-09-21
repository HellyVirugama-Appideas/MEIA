const TarotCard = require("../../models/TarotCard");
const TarotDraw = require("../../models/TarotDraw");
const TarotSettings = require("../../models/TarotSettings");
const ZodiacSignContent = require("../../models/ZodiacSignContent");
const { success, error } = require("../../utils/response");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// NAYA: "Rising Sign" card jo "The Draw" screen ke top pe dikhta hai -
// same pattern jo Celestial overview me use hota hai.
const getRisingSignCard = async (user) => {
  const risingSignName = user.birthChart?.ascendant?.sign || null;
  if (!risingSignName) return null;

  const content = await ZodiacSignContent.findOne({ signName: risingSignName });
  return {
    sign: risingSignName,
    icon: content?.icon || "",
    description: content?.description || null,
  };
};

exports.getAllCards = async (req, res, next) => {
  try {
    const risingSign = await getRisingSignCard(req.user);
    const today = startOfToday();

    const existing = await TarotDraw.findOne({ user: req.user._id, date: today }).populate("card");
    const cards = await TarotCard.find({ isActive: true });

    return success(res, "Cards fetched.", {
      drawn: !!existing,
      selectedCards: existing ? existing.cards : [],
      cards,               // hamesha saare active cards
      risingSign,
    });
  } catch (err) {
    next(err);
  }
};


exports.selectCard = async (req, res, next) => {
  try {
    const { cardId } = req.body;
    const today = startOfToday();
    const risingSign = await getRisingSignCard(req.user);

    if (!cardId) {
      return error(res, "cardId is required.", 400);
    }

    // Already selected today?
    const existing = await TarotDraw.findOne({ user: req.user._id, date: today }).populate("card");
    if (existing) {
      return success(res, "You've already selected a card today.", {
        cards: existing.cards,
        risingSign,
      });
    }

    const card = await TarotCard.findOne({ _id: cardId, isActive: true });
    if (!card) {
      return error(res, "Card not found or inactive.", 404);
    }

    await TarotDraw.create({
      user: req.user._id,
      cards: [card._id],
      date: today,
    });

    return success(res, "Card selected successfully.", {
      cards: [card],
      risingSign,
    }, 201);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  1. GET TODAY'S CARD(S) -> GET /api/tarot/today                     */
/*  Figma: "The Draw" screen - if already drawn today, returns same     */
/*  cards; otherwise tells frontend to call /shuffle                    */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getTodayCard = async (req, res, next) => {
  try {
    const today = startOfToday();
    const risingSign = await getRisingSignCard(req.user);

    const draw = await TarotDraw.findOne({ user: req.user._id, date: today }).populate("card");

    if (!draw) {
      // NAYA: admin-configured count bhi bhej rahe hain, taaki frontend
      // "Choose Your Card" screen pe pehle se pata ho kitne cards aayenge.
      const settings = await TarotSettings.findOne();
      const cardsPerDraw = settings?.cardsPerDraw;

      return success(res, "No cards drawn yet today.", {
        drawn: false,
        cards: [],
        cardsPerDraw,
        risingSign,
      });
    }

    return success(res, "Today's cards fetched.", {
      drawn: true,
      cards: draw.cards,
      risingSign,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. SHUFFLE & DRAW -> POST /api/tarot/shuffle                        */
/*  Figma: "Shuffle Cards" button -> "The Draw" detail screen           */
/*  Draws N cards (N = admin-configured TarotSettings.cardsPerDraw,     */
/*  default 2) - one draw per day per user (idempotent).                */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.shuffleAndDraw = async (req, res, next) => {
  try {
    const today = startOfToday();
    const risingSign = await getRisingSignCard(req.user);

    const existing = await TarotDraw.findOne({ user: req.user._id, date: today }).populate(
      "cards"
    );
    if (existing) {
      return success(res, "You've already drawn cards today.", {
        cards: existing.cards,
        risingSign,
      });
    }

    // NAYA: kitne cards draw karne hain - admin panel se dynamic, kisi
    // bhi jagah hardcoded nahi. Settings doc na ho to default 2.
    const settings = await TarotSettings.findOne();
    const cardsPerDraw = settings?.cardsPerDraw;

    const activeCards = await TarotCard.find({ isActive: true });
    if (activeCards.length === 0) {
      return error(res, "No tarot cards available.", 404);
    }
    if (activeCards.length < cardsPerDraw) {
      return error(
        res,
        `Not enough active tarot cards to draw ${cardsPerDraw}. Only ${activeCards.length} available.`,
        400
      );
    }

    // Fisher-Yates shuffle, then take first N - no duplicates in one draw.
    const shuffled = [...activeCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // const drawnCards = shuffled.slice(0, cardsPerDraw);

    await TarotDraw.create({
      user: req.user._id,
      cards: drawnCards.map((c) => c._id),
      date: today,
    });

    return success(res, "Cards drawn successfully.", { cards: drawnCards, risingSign }, 201);
  } catch (err) {
    next(err);
  }
};