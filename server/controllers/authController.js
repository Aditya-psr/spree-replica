import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function signup(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hash });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getUserData(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No user found" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60;
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password/${token}`;
  const html = `
    <div style="text-align:center; margin-bottom:20px;">
      <img src="https://yourdomain.com/logo.png" style="height:32px;">
    </div>
    <div style="max-width:600px;margin:auto;border:1px solid #dee3e7; border-radius:12px; padding:32px;background:#fff;">
      <p>Hello <a href="mailto:${user.email}">${user.email}</a>!</p>
      <p>Someone has requested a password change. Click the link below:</p>
      <p><a href="${resetUrl}" style="color:#2466dc;">Change my password</a></p>
      <p>If you didn't request this, ignore this email.</p>
      <p>Your password won’t change until you access the link and set a new one.</p>
    </div>
    <div style="text-align:center; margin-top:30px; color:#888;">
      Spree Commerce DEMO<br/>
      <a href="#" style="color:#2466dc;text-decoration:underline;">Terms of Service</a> | <a href="#" style="color:#2466dc;text-decoration:underline;">Privacy Policy</a>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset Request",
    html,
  });

  res.json({ success: true });
}

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function addAddress(req, res) {
  try {
    const userId = req.user.id;
    const newAddress = req.body;

    if (newAddress.isDefaultDelivery) {
      await User.updateOne(
        { _id: userId },
        { $set: { "addresses.$[elem].isDefaultDelivery": false } },
        { arrayFilters: [{ "elem.isDefaultDelivery": true }] }
      );
    }
    if (newAddress.isDefaultBilling) {
      await User.updateOne(
        { _id: userId },
        { $set: { "addresses.$[elem].isDefaultBilling": false } },
        { arrayFilters: [{ "elem.isDefaultBilling": true }] }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: newAddress } },
      { new: true }
    );
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function editAddress(req, res) {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;
    const updated = req.body;

    if (updated.isDefaultDelivery) {
      await User.updateOne(
        { _id: userId },
        { $set: { "addresses.$[elem].isDefaultDelivery": false } },
        { arrayFilters: [{ "elem.isDefaultDelivery": true }] }
      );
    }
    if (updated.isDefaultBilling) {
      await User.updateOne(
        { _id: userId },
        { $set: { "addresses.$[elem].isDefaultBilling": false } },
        { arrayFilters: [{ "elem.isDefaultBilling": true }] }
      );
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      {
        $set: {
          "addresses.$": {
            ...updated,
            _id: addressId,
          },
        },
      },
      { new: true }
    );
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirmation do not match." });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      return res.status(401).json({ message: "Current password incorrect." });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}