import { Router } from "express";
import {
  googleAuth,
  googleCallback,
  getMe,
  googleUpgrade,
  googleUpgradeCallback,
  logout,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Matches Next.js: app/api/auth/google/route.ts
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/google/upgrade", googleUpgrade);
router.get("/google/callback/upgrade", googleUpgradeCallback);
router.get("/me", authMiddleware, getMe);
router.get("/logout", logout);
export default router;
