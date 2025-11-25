import { Router } from "express";
const router = Router();

import { getAllCategories } from "../controllers/categoriesController.js";

router.get("/", getAllCategories);

export default router;
