import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import authRoutes from "./routes/auth.js";
import newsletterRoutes from "./routes/newsletter.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("🛍️ E-commerce API is running...");
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
