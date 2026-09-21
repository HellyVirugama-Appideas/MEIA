const stripe = require("../config/stripe");

/* ============================================================
   Stripe Product/Price helpers for Subscription Plans.

   WHY THIS EXISTS:
   Stripe Price objects are IMMUTABLE - once created, you cannot
   change their amount, currency, or interval. The old approach
   (admin pastes a stripePriceId created manually in the Stripe
   Dashboard) meant every price change required a human to go
   create a new Price in Stripe first. That's slow, error-prone,
   and leaks a Stripe implementation detail into the admin UI.

   Instead: admin only ever fills in name / price / currency /
   billingCycle / features in the CMS. This helper takes care of
   creating a Stripe Product once, then creating a new Price
   under that same Product whenever price/currency/billingCycle
   changes, and archiving the old Price (Stripe doesn't allow
   deleting Prices, only deactivating them).
============================================================ */

const BILLING_CYCLE_TO_STRIPE_INTERVAL = {
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

/**
 * Create a brand-new Stripe Product + Price for a new plan.
 * Returns { stripeProductId, stripePriceId }.
 */
async function createStripeProductAndPrice({ name, price, currency, billingCycle }) {
  const interval = BILLING_CYCLE_TO_STRIPE_INTERVAL[billingCycle];
  if (!interval) {
    throw new Error(`Unsupported billingCycle "${billingCycle}" - expected weekly/monthly/yearly.`);
  }

  const product = await stripe.products.create({ name });

  const stripePrice = await stripe.prices.create({
    unit_amount: Math.round(Number(price) * 100), // Stripe wants the smallest currency unit
    currency: currency.toLowerCase(),
    recurring: { interval },
    product: product.id,
  });

  return { stripeProductId: product.id, stripePriceId: stripePrice.id };
}

/**
 * Called on plan update. If price/currency/billingCycle actually
 * changed, archives the old Price and creates a new one under the
 * SAME Product (reusing the product avoids orphaned Stripe products).
 * If nothing pricing-related changed, just syncs the product name
 * and returns the existing IDs untouched.
 *
 * `existingPlan` = the current DB document before this update.
 * `updates` = { name, price, currency, billingCycle }.
 * Returns { stripeProductId, stripePriceId } (same or new).
 */
async function syncStripeProductAndPrice(existingPlan, updates) {
  const priceChanged =
    Number(existingPlan.price) !== Number(updates.price) ||
    (existingPlan.currency || "").toLowerCase() !== (updates.currency || "").toLowerCase() ||
    existingPlan.billingCycle !== updates.billingCycle;

  // No existing Stripe product yet (e.g. plan created before this fix
  // was applied) - just create fresh, same as a brand-new plan.
  if (!existingPlan.stripeProductId || !existingPlan.stripePriceId) {
    return createStripeProductAndPrice(updates);
  }

  // Keep the Stripe product name in sync regardless of whether price changed.
  if (updates.name && updates.name !== existingPlan.name) {
    await stripe.products.update(existingPlan.stripeProductId, { name: updates.name });
  }

  if (!priceChanged) {
    return {
      stripeProductId: existingPlan.stripeProductId,
      stripePriceId: existingPlan.stripePriceId,
    };
  }

  const interval = BILLING_CYCLE_TO_STRIPE_INTERVAL[updates.billingCycle];
  if (!interval) {
    throw new Error(`Unsupported billingCycle "${updates.billingCycle}" - expected weekly/monthly/yearly.`);
  }

  // Create the new Price under the SAME product...
  const newPrice = await stripe.prices.create({
    unit_amount: Math.round(Number(updates.price) * 100),
    currency: updates.currency.toLowerCase(),
    recurring: { interval },
    product: existingPlan.stripeProductId,
  });

  // ...then archive the old one. Stripe doesn't allow deleting Prices,
  // only deactivating them - existing subscribers on the old price are
  // NOT affected by this, they keep billing at their original price
  // until they switch plans or resubscribe.
  try {
    await stripe.prices.update(existingPlan.stripePriceId, { active: false });
  } catch (err) {
    console.warn("Could not archive old Stripe price:", err.message);
  }

  return { stripeProductId: existingPlan.stripeProductId, stripePriceId: newPrice.id };
}

/**
 * Called on plan delete. Archives the Price and the Product in
 * Stripe (soft-delete - Stripe never allows hard deletion of either
 * once they've been used).
 */
async function archiveStripeProductAndPrice(plan) {
  if (plan.stripePriceId) {
    try {
      await stripe.prices.update(plan.stripePriceId, { active: false });
    } catch (err) {
      console.warn("Could not archive Stripe price on delete:", err.message);
    }
  }

  if (plan.stripeProductId) {
    try {
      await stripe.products.update(plan.stripeProductId, { active: false });
    } catch (err) {
      console.warn("Could not archive Stripe product on delete:", err.message);
    }
  }
}

/* ============================================================
   Supported currencies - dropdown source for the admin form.
   Keep this list to currencies Stripe actually supports (it
   supports 135+, this covers the common ones; extend as needed).
============================================================ */
const SUPPORTED_CURRENCIES = [
  { code: "usd", label: "USD - US Dollar", symbol: "$" },
  { code: "eur", label: "EUR - Euro", symbol: "€" },
  { code: "gbp", label: "GBP - British Pound", symbol: "£" },
  { code: "inr", label: "INR - Indian Rupee", symbol: "₹" },
  { code: "aud", label: "AUD - Australian Dollar", symbol: "A$" },
  { code: "cad", label: "CAD - Canadian Dollar", symbol: "C$" },
  { code: "aed", label: "AED - UAE Dirham", symbol: "د.إ" },
  { code: "sgd", label: "SGD - Singapore Dollar", symbol: "S$" },
  { code: "jpy", label: "JPY - Japanese Yen", symbol: "¥" },
];

module.exports = {
  createStripeProductAndPrice,
  syncStripeProductAndPrice,
  archiveStripeProductAndPrice,
  SUPPORTED_CURRENCIES,
  BILLING_CYCLE_TO_STRIPE_INTERVAL,
};