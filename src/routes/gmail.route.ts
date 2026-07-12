import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as gmailController from "../controllers/gmail.controller.js";

const router = Router();

router.get("/sync", authMiddleware,gmailController.syncMyGmail);

export default router;
