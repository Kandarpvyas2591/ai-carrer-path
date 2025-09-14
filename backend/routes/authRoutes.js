import { Router } from "express";
import { signup, login, logout, getMe, updateProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);

export default router;


