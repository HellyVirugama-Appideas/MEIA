const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "[Stripe] STRIPE_SECRET_KEY not set in .env - subscription/payment APIs will fail until it's added."
  );
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

module.exports = stripe;
