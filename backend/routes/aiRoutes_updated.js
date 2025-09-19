// routes/aiRoutes.js
import express from "express";
import { 
  generateCareerRoadmap, 
  getUserProfiles, 
  getProfileById,
  deleteProfile
} from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// POST: Generate AI-driven career plan
router.post("/career-plan", requireAuth, generateCareerRoadmap);

// GET: Get user's AI profiles
router.get("/profiles", requireAuth, getUserProfiles);

// GET: Get specific AI profile by ID
router.get("/profiles/:profileId", requireAuth, getProfileById);

// DELETE: Delete specific AI profile by ID
router.delete("/profiles/:profileId", requireAuth, deleteProfile);

export default router;
