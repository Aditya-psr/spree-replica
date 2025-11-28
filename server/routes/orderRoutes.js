import express from "express";
import authMiddleware from "../middleware/auth.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

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

function buildOrderEmailHtml(order, user) {
  const currencySymbol = "€";

  const itemsRows =
    order.items && order.items.length
      ? order.items
          .map(
            (item) => `
      <tr>
        <td style="padding:8px 4px; border-bottom:1px solid #eee;">
          <div style="font-weight:500;">${item.name || ""}</div>
          <div style="font-size:12px; color:#666;">
            ${item.colorName || item.color || ""}${
              item.size ? " • Size " + item.size : ""
            }
          </div>
        </td>
        <td style="padding:8px 4px; border-bottom:1px solid #eee; text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:8px 4px; border-bottom:1px solid #eee; text-align:right;">
          ${currencySymbol}${(item.price || 0).toFixed(2)}
        </td>
        <td style="padding:8px 4px; border-bottom:1px solid #eee; text-align:right;">
          ${currencySymbol}${((item.price || 0) * (item.quantity || 1)).toFixed(
              2
            )}
        </td>
      </tr>
    `
          )
          .join("")
      : "";

  const shipping = order.shippingAddress || {};
  const fullName =
    shipping.fullName ||
    `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim() ||
    user.email;

  const shippingAddressBlock = `
    <div style="font-weight:500; margin-bottom:4px;">${fullName}</div>
    ${
      shipping.street
        ? `<div style="margin-bottom:2px;">${shipping.street}</div>`
        : ""
    }
    <div style="margin-bottom:2px;">
      ${shipping.city || ""}${shipping.city ? "," : ""} ${
    shipping.state || ""
  } ${shipping.postalCode || ""} ${shipping.country || ""}
    </div>
    ${
      shipping.phone
        ? `<div style="margin-bottom:2px;">Phone: ${shipping.phone}</div>`
        : ""
    }
  `;

  const orderNumber = order._id.toString().slice(-6).toUpperCase();

  return `
  <div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f5f5f5; padding:24px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e4e4e4;">
      <div style="padding:20px 24px; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <a href="${
            process.env.CLIENT_URL || "http://localhost:3000"
          }" style="display:inline-block; height:40px;">
                <img
                  src="${
                    process.env.CLIENT_URL || "http://localhost:3000"
                  }/LogoFull1.png"
                  alt="Spree logo"
                  style="height:40px; width:auto; margin-right:8px; object-fit:contain;"
          />
          </a>
        </div>
        <div style="font-size:12px; color:#777;">ORDER CONFIRMATION</div>
      </div>
      <div style="padding:24px;">
        <p style="font-size:15px; margin:0 0 10px 0;">Hi ${user.email},</p>
        <p style="font-size:14px; margin:0 0 16px 0; color:#444;">
          Thank you for your order! We’ve received your payment and are getting your order ready.
        </p>

        <div style="background:#f7f7f7; border-radius:8px; padding:12px 14px; margin-bottom:20px;">
          <div style="font-size:13px; color:#666;">Order</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <div style="font-size:15px; font-weight:600;">
              #${orderNumber}
            </div>
            <div style="font-size:13px; color:#00aa55; font-weight:600; text-transform:uppercase;">
              ${order.status || "processing"}
            </div>
          </div>
          ${
            order.deliveryEstimateText
              ? `<div style="font-size:13px; color:#333; margin-top:4px;">
                  ${order.deliveryEstimateText}
                </div>`
              : ""
          }
        </div>

        <h3 style="font-size:15px; margin:0 0 8px 0;">Order summary</h3>

        <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
          <thead>
            <tr>
              <th style="text-align:left; padding:6px 4px; border-bottom:1px solid #ddd;">Item</th>
              <th style="text-align:center; padding:6px 4px; border-bottom:1px solid #ddd;">Qty</th>
              <th style="text-align:right; padding:6px 4px; border-bottom:1px solid #ddd;">Price</th>
              <th style="text-align:right; padding:6px 4px; border-bottom:1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="text-align:right; font-size:13px; margin-bottom:20px;">
          <div style="margin-bottom:3px;">
            <span style="color:#666;">Subtotal:</span>
            <span style="margin-left:8px; font-weight:500;">
              ${currencySymbol}${(order.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div style="margin-bottom:3px;">
            <span style="color:#666;">Shipping:</span>
            <span style="margin-left:8px; font-weight:500;">
              ${currencySymbol}${(order.shippingPrice || 0).toFixed(2)}
            </span>
          </div>
          <div style="margin-top:6px; font-size:14px; font-weight:600;">
            <span>Total:</span>
            <span style="margin-left:8px;">
              ${currencySymbol}${(order.total || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <h3 style="font-size:15px; margin:0 0 8px 0;">Shipping address</h3>
        <div style="font-size:13px; color:#333; margin-bottom:20px;">
          ${shippingAddressBlock}
        </div>

        <p style="font-size:13px; color:#555; margin:0;">
          You’ll receive another email once your order has been shipped.
        </p>
      </div>

      <div style="border-top:1px solid #f0f0f0; padding:12px 18px; text-align:center; font-size:11px; color:#999;">
        This is a demo Spree-like storefront. Payments are processed in test mode.
      </div>
    </div>
  </div>
  `;
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

    try {
      const user = await User.findById(req.user.id).select("email");
      if (user && user.email) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const html = buildOrderEmailHtml(order, user);

        await transporter.sendMail({
          to: user.email,
          from: process.env.SMTP_USER,
          subject: `Your order #${order._id
            .toString()
            .slice(-6)
            .toUpperCase()} has been received`,
          html,
        });
      }
    } catch (mailErr) {
      console.error("Failed to send order confirmation email:", mailErr);
    }

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
