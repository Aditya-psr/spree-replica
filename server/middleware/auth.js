// middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set in .env");
  throw new Error("JWT_SECRET is required");
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token:", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

export default authMiddleware;
