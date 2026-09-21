const stripe = require("../../config/stripe");
const SubscriptionPlan = require("../../models/SubscriptionPlan");
const UserSubscription = require("../../models/UserSubscription");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/*  1. GET PLANS -> GET /api/subscription/plans                        */
/*  Figma: "Why Go Pro?" comparison table + "Switch Your Plan" screen   */
/*  Public                                                              */
/* ------------------------------------------------------------------ */
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ order: 1 });
    return success(res, "Plans fetched.", { plans });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  2. GET MY SUBSCRIPTION -> GET /api/subscription/my-subscription     */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getMySubscription = async (req, res, next) => {
  try {
    const subscription = await UserSubscription.findOne({ user: req.user._id }).populate("plan");
    return success(res, "Subscription fetched.", {
      subscription: subscription || { status: "none" },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  3. SUBSCRIBE -> POST /api/subscription/subscribe                    */
/*  Figma: "Credit/Debit Card" screen -> "Premium Activated" success    */
/*  Body: { planId, paymentMethodId }                                   */
/*  paymentMethodId comes from Stripe's mobile SDK (card tokenized      */
/*  client-side - raw card numbers should NEVER hit this backend)       */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.subscribe = async (req, res, next) => {
  try {
    const { planId, paymentMethodId } = req.body;

    if (!planId || !paymentMethodId) {
      return error(res, "planId and paymentMethodId are required.", 422);
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) return error(res, "Plan not found.", 404);

    const user = req.user;
    let userSub = await UserSubscription.findOne({ user: user._id });

    // 1) Create or reuse Stripe customer
    let stripeCustomerId = userSub?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: user.name,
        phone: `${user.countryCode}${user.phone}`,
        email: user.email || undefined,
        metadata: { userId: user._id.toString() },
      });
      stripeCustomerId = customer.id;
    }

    // 2) Attach payment method to customer + set as default
    await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // 3) Create the subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    userSub = await UserSubscription.findOneAndUpdate(
      { user: user._id },
      {
        plan: plan._id,
        stripeCustomerId,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status === "active" ? "active" : "incomplete",
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: false,
      },
      { upsert: true, new: true }
    );

    user.isPro = stripeSubscription.status === "active";
    await user.save();

    return success(res, "Subscription activated successfully.", { subscription: userSub }, 201);
  } catch (err) {
    if (err.type === "StripeCardError") {
      return error(res, err.message, 402);
    }
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  4. CANCEL SUBSCRIPTION -> POST /api/subscription/cancel              */
/*  Figma: "Cancel Subscription?" confirm -> "Subscription Cancelled"   */
/*  (protected) - cancels at end of current billing period              */
/* ------------------------------------------------------------------ */
exports.cancelSubscription = async (req, res, next) => {
  try {
    const userSub = await UserSubscription.findOne({ user: req.user._id });
    if (!userSub || !userSub.stripeSubscriptionId) {
      return error(res, "No active subscription found.", 404);
    }

    const stripeSubscription = await stripe.subscriptions.update(
      userSub.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    userSub.cancelAtPeriodEnd = true;
    userSub.status = "cancelled";
    await userSub.save();

    return success(res, "Subscription will be cancelled at the end of the billing period.", {
      subscription: userSub,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  5. SWITCH PLAN -> POST /api/subscription/switch-plan                */
/*  Figma: "Switch Your Plan" screen -> "Plan Updated" success          */
/*  Body: { planId }                                                    */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.switchPlan = async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) return error(res, "planId is required.", 422);

    const newPlan = await SubscriptionPlan.findById(planId);
    if (!newPlan || !newPlan.isActive) return error(res, "Plan not found.", 404);

    const userSub = await UserSubscription.findOne({ user: req.user._id });
    if (!userSub || !userSub.stripeSubscriptionId) {
      return error(res, "No active subscription to switch. Please subscribe first.", 400);
    }

    const currentStripeSub = await stripe.subscriptions.retrieve(userSub.stripeSubscriptionId);

    const updatedStripeSub = await stripe.subscriptions.update(userSub.stripeSubscriptionId, {
      items: [{ id: currentStripeSub.items.data[0].id, price: newPlan.stripePriceId }],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
    });

    userSub.plan = newPlan._id;
    userSub.status = "active";
    userSub.cancelAtPeriodEnd = false;
    userSub.currentPeriodEnd = new Date(updatedStripeSub.current_period_end * 1000);
    await userSub.save();

    req.user.isPro = true;
    await req.user.save();

    return success(res, "Plan updated successfully.", { subscription: userSub });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  6. STRIPE WEBHOOK -> POST /api/subscription/webhook                 */
/*  Keeps subscription status in sync with Stripe (renewals, failed     */
/*  payments, etc). Must use express.raw() body parser - see routes.    */
/* ------------------------------------------------------------------ */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const User = require("../../models/User");

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userSub = await UserSubscription.findOne({ stripeSubscriptionId: sub.id });
        if (userSub) {
          userSub.status = sub.status === "active" ? "active" : sub.status === "canceled" ? "cancelled" : sub.status;
          userSub.currentPeriodEnd = new Date(sub.current_period_end * 1000);
          userSub.cancelAtPeriodEnd = sub.cancel_at_period_end;
          await userSub.save();

          await User.findByIdAndUpdate(userSub.user, { isPro: sub.status === "active" });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const userSub = await UserSubscription.findOne({ stripeCustomerId: invoice.customer });
        if (userSub) {
          userSub.status = "past_due";
          await userSub.save();
        }
        break;
      }
      default:
        break; // unhandled event types are safely ignored
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Webhook handler failed");
  }
};
