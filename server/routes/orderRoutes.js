import express from "express";
import authMiddleware from "../middleware/auth.js";
import Order from "../models/Order.js";

const router = express.Router();

function getDeliveryEstimateText(methodId) {
  switch (methodId) {
    case "standard":
      return "Delivers in 3–5 business days";
    case "premium":
      return "Delivers in 2–3 business days";
    case "nextday":
      return "Delivers in 1–2 business days";
    default:
      return "Delivery time not specified";
  }
}

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      items,
      subtotal,
      shippingPrice,
      currency,
      shippingMethodId,
      shippingMethodLabel,
      shippingAddress,
      paymentIntentId,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const total = Number(subtotal || 0) + Number(shippingPrice || 0);
    const deliveryEstimateText = getDeliveryEstimateText(shippingMethodId);

    const order = await Order.create({
      user: req.user.id,
      items,
      subtotal,
      shippingPrice,
      total,
      currency: currency || "usd",
      shippingMethodId,
      shippingMethodLabel,
      deliveryEstimateText,
      shippingAddress: shippingAddress || {},
      paymentStatus: "paid",
      paymentIntentId: paymentIntentId || "",
      status: "processing",
    });

    return res.status(201).json({ order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;
