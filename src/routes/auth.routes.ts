import { Router } from "express";
import {
  googleAuth,
  googleCallback,
  googleUpgrade,
  googleUpgradeCallback,
  logout,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Matches Next.js: app/api/auth/google/route.ts
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/google/upgrade", authMiddleware, googleUpgrade);
router.get("/google/callback/upgrade", authMiddleware, googleUpgradeCallback);
router.get("/logout", logout);
export default router;
