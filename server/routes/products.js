import express from "express";
import {
  getAllProducts,
  getNewArrivals,
  getSaleProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/search", searchProducts);
router.get("/", getAllProducts);
router.get("/new", getNewArrivals);
router.get("/sale", getSaleProducts);
router.get("/:id", getProductById);

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;