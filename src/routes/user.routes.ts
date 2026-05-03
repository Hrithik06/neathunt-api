import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getMe } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validator.js";
import { updateTimezoneSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.patch("/timezone", validate(updateTimezoneSchema), authMiddleware);

export default router;
