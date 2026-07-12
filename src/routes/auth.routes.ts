import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Matches Next.js: app/api/auth/google/route.ts
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);
router.get("/google/upgrade", authMiddleware, authController.googleUpgrade);
router.get("/google/callback/upgrade", authMiddleware, authController.googleUpgradeCallback);
router.get("/logout", authController.logout);
export default router;
