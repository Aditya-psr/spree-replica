import express from "express";
import { subscribeNewsletter, verifyNewsletter } from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/", subscribeNewsletter);
router.get("/verify", verifyNewsletter);

export default router;
