// routes/aiRoutes.js
import express from "express";
import { generateCareerRoadmap } from "../controllers/aiController.js";

const router = express.Router();

// POST: Generate AI-driven career plan
router.post("/career-plan", generateCareerRoadmap);

export default router;
