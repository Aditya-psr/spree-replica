import NewsletterSubscriber from "../models/newsletterModel.js";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const token = uuidv4();

    // Upsert subscriber
    await NewsletterSubscriber.findOneAndUpdate(
      { email },
      { token, verified: false },
      { upsert: true }
    );

    const verifyUrl = `${process.env.BASE_URL}/api/newsletter/verify?token=${token}`;

    const html = `
      <div style="font-family:sans-serif;">
        <h2>Hey,</h2>
        <p>Please click the button below to verify your email address.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:10px 18px;background:#3176d6;color:#fff;text-decoration:none;border-radius:4px;">Verify email address</a>
        </p>
        <p>If the button doesn't work please copy and paste:<br>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <p>If you didn't request this, please ignore this email.<br>
        Thank you<br>
        Spree Commerce DEMO Team</p>
        <div style="margin:2em 0;">
          Spree Commerce DEMO<br/>
          <a href="#">Terms of Service</a> | <a href="#">Privacy Policy</a>
        </div>
      </div>
    `;

    // Configure transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Verify your email address",
      html,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    res.status(500).json({ error: "Failed to subscribe." });
  }
};

export const verifyNewsletter = async (req, res) => {
  try {
    const { token } = req.query;
    const result = await NewsletterSubscriber.findOneAndUpdate(
      { token },
      { verified: true }
    );
    if (result) {
      res.redirect(`${process.env.COMPANY_URL || "http://localhost:3000"}?verified=true`);
    } else {
      res.status(400).send("Invalid or expired token.");
    }
  } catch (e) {
    res.status(500).send("Server error");
  }
};

