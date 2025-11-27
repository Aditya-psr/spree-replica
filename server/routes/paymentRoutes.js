import express from "express";
import Stripe from "stripe";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

function buildStripeAddress(addr = {}) {
  return {
    line1: addr.line1 || addr.street || "Address line 1",
    line2: addr.line2 || addr.apt || undefined,
    city: addr.city || undefined,
    state: addr.state || undefined,
    postal_code: addr.postalCode || addr.postal_code || undefined,
    country: (addr.country || "IN").toUpperCase(),
  };
}

router.post("/create-intent", authMiddleware, async (req, res) => {
  try {
    const { amount, currency = "usd", customer } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount is required" });
    }

    if (!customer || !customer.name || !customer.address) {
      return res.status(400).json({
        message:
          "Customer name and address are required for international payments.",
      });
    }

    const stripeAddress = buildStripeAddress(customer.address);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: `Order for ${customer.name}`,
      shipping: {
        name: customer.name,
        address: stripeAddress,
      },
      metadata: {
        userId: req.user.id?.toString?.() || String(req.user.id),
        customerName: customer.name,
        customerCity: stripeAddress.city || "",
      },
      automatic_payment_methods: { enabled: true },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe create-intent error:", err);
    res.status(500).json({ message: "Payment initialization failed" });
  }
});

export default router;
