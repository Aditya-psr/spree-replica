import express from "express";
import authMiddleware, { isAdmin } from "../middleware/auth.js";
import {
  getAllUsers,
  getAllProducts,
  addNewProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/adminController.js";

const router = express.Router();

// Users
router.get("/users", authMiddleware, isAdmin, getAllUsers);

// Products
router.get("/products", authMiddleware, isAdmin, getAllProducts);
router.post("/products", authMiddleware, isAdmin, addNewProduct);
router.put("/products/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/products/:id", authMiddleware, isAdmin, deleteProduct);

export default router;
