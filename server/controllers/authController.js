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
    const incoming = req.body;

    // Normalize field names from frontend
    const defaultDelivery =
      incoming.defaultDelivery ?? incoming.isDefaultDelivery ?? false;
    const defaultBilling =
      incoming.defaultBilling ?? incoming.isDefaultBilling ?? false;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    const newAddress = {
      country: incoming.country || "",
      firstName: incoming.firstName || "",
      lastName: incoming.lastName || "",
      street: incoming.street || "",
      apt: incoming.apt || "",
      city: incoming.city || "",
      state: incoming.state || "",
      postalCode: incoming.postalCode || "",
      phone: incoming.phone || "",
      defaultDelivery: Boolean(defaultDelivery),
      defaultBilling: Boolean(defaultBilling),
    };

    // If this is the first address → force default
    if (user.addresses.length === 0) {
      newAddress.defaultDelivery = true;
      newAddress.defaultBilling = true;
    }

    // If this new address is default, clear flags on others
    if (newAddress.defaultDelivery || newAddress.defaultBilling) {
      user.addresses = user.addresses.map((addrDoc) => {
        const addr = addrDoc.toObject ? addrDoc.toObject() : addrDoc;
        return {
          ...addr,
          defaultDelivery: newAddress.defaultDelivery
            ? false
            : !!addr.defaultDelivery,
          defaultBilling: newAddress.defaultBilling
            ? false
            : !!addr.defaultBilling,
        };
      });
    }

    // ✅ PUSH, don't overwrite the array
    user.addresses.push(newAddress);

    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error("addAddress error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function editAddress(req, res) {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;
    const incoming = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    const defaultDelivery =
      incoming.defaultDelivery ?? incoming.isDefaultDelivery ?? false;
    const defaultBilling =
      incoming.defaultBilling ?? incoming.isDefaultBilling ?? false;

    const isSettingDefault = defaultDelivery || defaultBilling;

    // If making this address default → clear previous defaults
    if (isSettingDefault) {
      user.addresses = user.addresses.map((addrDoc) => {
        const addr = addrDoc.toObject ? addrDoc.toObject() : addrDoc;
        return {
          ...addr,
          defaultDelivery: defaultDelivery ? false : !!addr.defaultDelivery,
          defaultBilling: defaultBilling ? false : !!addr.defaultBilling,
        };
      });
    }

    // Update the specific address
    user.addresses = user.addresses.map((addrDoc) => {
      const addr = addrDoc.toObject ? addrDoc.toObject() : addrDoc;

      if (addr._id.toString() !== addressId) {
        return addr;
      }

      return {
        ...addr,
        ...incoming,
        defaultDelivery: isSettingDefault
          ? Boolean(defaultDelivery)
          : !!addr.defaultDelivery,
        defaultBilling: isSettingDefault
          ? Boolean(defaultBilling)
          : !!addr.defaultBilling,
      };
    });

    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error("editAddress error:", err);
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
