import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware, { isAdmin } from "../middleware/auth.js";
import {
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();

/* ---------- SIGNUP ---------- */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "user", // default to user
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- LOGIN ---------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secretKey123",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- GET CURRENT USER ---------- */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- ADMIN DASHBOARD TEST ---------- */
router.get("/admin/dashboard", authMiddleware, isAdmin, async (req, res) => {
  res.json({ message: "Welcome, Admin! This is your dashboard." });
});

/* ---------- PASSWORD ROUTES ---------- */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", authMiddleware, changePassword);

/* ---------- ADDRESSES ---------- */
// Get all
router.get("/addresses", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ addresses: user.addresses });
});
// POST /addresses – Add new address
router.post("/addresses", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAddress = req.body;

    // Ensure only one default delivery
    if (newAddress.defaultDelivery) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr._doc,
        defaultDelivery: false,
      }));
    }

    // Ensure only one default billing
    if (newAddress.defaultBilling) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr._doc,
        defaultBilling: false,
      }));
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /addresses/:id – Edit an address
router.put("/addresses/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.addresses.findIndex((a) => a._id.toString() === id);
    if (index === -1)
      return res.status(404).json({ message: "Address not found" });

    const updated = req.body;

    if (updated.defaultDelivery) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr._doc,
        defaultDelivery: addr._id.toString() === id,
      }));
    }

    if (updated.defaultBilling) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr._doc,
        defaultBilling: addr._id.toString() === id,
      }));
    }

    user.addresses[index] = { ...user.addresses[index]._doc, ...updated };
    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /addresses/:id – Delete an address
router.delete("/addresses/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter((a) => a._id.toString() !== id);
    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/auth/profile
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
