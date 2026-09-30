const SubscriptionPlan = require("../../models/SubscriptionPlan");
const UserSubscription = require("../../models/UserSubscription");
const {
  createStripeProductAndPrice,
  syncStripeProductAndPrice,
  archiveStripeProductAndPrice,
  SUPPORTED_CURRENCIES,
} = require("../../utils/Stripeplanhelpers");

/* ===================== SUBSCRIPTION PLANS ===================== */
exports.listPlans = async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({ order: 1 });
  res.render("subscription_plans", {
    title: "Subscription Plans",
    plans,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.newPlanForm = (req, res) => {
  res.render("subscription_plan_form", {
    title: "Add Subscription Plan",
    plan: null,
    currencies: SUPPORTED_CURRENCIES,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

/* ------------------------------------------------------------------
   CREATE PLAN
   Admin never enters a Stripe Price ID - we create the Stripe
   Product + Price automatically from name/price/currency/billingCycle
   and store the resulting IDs on the plan document.
------------------------------------------------------------------ */
exports.createPlan = async (req, res) => {
  try {
    const { name, billingCycle, price, currency, features, isActive, order } = req.body;

    const planData = {
      name,
      billingCycle,
      price: parseFloat(price),
      currency: (currency || "usd").toLowerCase(),
    };

    const { stripeProductId, stripePriceId } = await createStripeProductAndPrice(planData);

    await SubscriptionPlan.create({
      ...planData,
      stripeProductId,
      stripePriceId,
      features: features ? features.split("\n").map((f) => f.trim()).filter(Boolean) : [],
      isActive: isActive === "on",
      order: parseInt(order) || 0,
    });

    req.flash("success", "Subscription plan added successfully!");
    res.redirect("/admin/subscription/plans");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message || "Failed to add plan.");
    res.redirect("/admin/subscription/plans/add");
  }
};

exports.editPlanForm = async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);
  if (!plan) {
    req.flash("error", "Plan not found.");
    return res.redirect("/admin/subscription/plans");
  }
  res.render("subscription_plan_form", {
    title: "Edit Subscription Plan",
    plan,
    currencies: SUPPORTED_CURRENCIES,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

/* ------------------------------------------------------------------
   UPDATE PLAN
   If price/currency/billingCycle actually changed, a NEW Stripe
   Price is created under the same Product (Prices are immutable in
   Stripe) and the old one is archived. If nothing pricing-related
   changed, the existing Stripe IDs are reused untouched.
------------------------------------------------------------------ */
exports.updatePlan = async (req, res) => {
  try {
    const { name, billingCycle, price, currency, features, isActive, order } = req.body;

    const existingPlan = await SubscriptionPlan.findById(req.params.id);
    if (!existingPlan) {
      req.flash("error", "Plan not found.");
      return res.redirect("/admin/subscription/plans");
    }

    const updates = {
      name,
      billingCycle,
      price: parseFloat(price),
      currency: (currency || "usd").toLowerCase(),
    };

    const { stripeProductId, stripePriceId } = await syncStripeProductAndPrice(existingPlan, updates);

    await SubscriptionPlan.findByIdAndUpdate(req.params.id, {
      ...updates,
      stripeProductId,
      stripePriceId,
      features: features ? features.split("\n").map((f) => f.trim()).filter(Boolean) : [],
      isActive: isActive === "on",
      order: parseInt(order) || 0,
    });

    req.flash("success", "Plan updated successfully!");
    res.redirect("/admin/subscription/plans");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message || "Failed to update plan.");
    res.redirect(`/admin/subscription/plans/edit/${req.params.id}`);
  }
};

/* ------------------------------------------------------------------
   DELETE PLAN
   Archives the plan's Stripe Price + Product (Stripe never allows
   hard-deleting either) before removing it from our DB. Blocks
   deletion if active subscribers are still on this plan, so history
   / populate() calls elsewhere don't break.
------------------------------------------------------------------ */
exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      req.flash("error", "Plan not found.");
      return res.redirect("/admin/subscription/plans");
    }

    const activeSubscriberCount = await UserSubscription.countDocuments({
      plan: plan._id,
      status: { $in: ["active", "past_due"] },
    });

    if (activeSubscriberCount > 0) {
      req.flash(
        "error",
        `Cannot delete - ${activeSubscriberCount} user(s) are currently on this plan. Deactivate it instead.`
      );
      return res.redirect("/admin/subscription/plans");
    }

    await archiveStripeProductAndPrice(plan);
    await SubscriptionPlan.findByIdAndDelete(req.params.id);

    req.flash("success", "Plan deleted successfully!");
    res.redirect("/admin/subscription/plans");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete plan.");
    res.redirect("/admin/subscription/plans");
  }
};

/* ===================== ACTIVE SUBSCRIBERS ===================== */
exports.listSubscribers = async (req, res) => {
  const subscriptions = await UserSubscription.find()
    .populate("user", "name phone email")
    .populate("plan", "name billingCycle price currency")
    .sort({ createdAt: -1 });

  res.render("subscribers", {
    title: "Subscribers",
    subscriptions,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};