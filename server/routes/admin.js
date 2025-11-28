import express from "express";
import authMiddleware, { isAdmin } from "../middleware/auth.js";
import {
  getAllUsers,
  getAllProducts,
  addNewProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/adminController.js";

import User from "../models/User.js";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/users", authMiddleware, isAdmin, getAllUsers);

router.get("/users/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.get("/users/:id/orders", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.delete("/users/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to remove user." });
  }
});

router.get("/orders", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status, category, from, to } = req.query;

    const andConditions = [];

    if (status && status !== "all") {
      andConditions.push({ status });
    }

    if (from || to) {
      const createdAt = {};
      if (from) createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        createdAt.$lte = end;
      }
      andConditions.push({ createdAt });
    }

    if (category && category.trim()) {
      const term = category.trim();
      const regex = new RegExp(term, "i");

      andConditions.push({
        $or: [
          { "items.name": regex },
          { "items.category": regex },
          { "items.categorySlug": regex },
          { "items.categoryName": regex },
        ],
      });
    }

    const mongoQuery = andConditions.length > 0 ? { $and: andConditions } : {};

    const orders = await Order.find(mongoQuery)
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders });
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/products", authMiddleware, isAdmin, getAllProducts);
router.post("/products", authMiddleware, isAdmin, addNewProduct);
router.put("/products/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/products/:id", authMiddleware, isAdmin, deleteProduct);

export default router;
