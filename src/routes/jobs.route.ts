import { Router } from "express";
import {
  addJob,
  deleteJob,
  editJob,
  getJobs,
} from "../controllers/jobs.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/jobs", authMiddleware, getJobs);
router.post("/jobs", authMiddleware, addJob);
router.patch("/jobs/:id", authMiddleware, editJob);
router.delete("/jobs/:id", authMiddleware, deleteJob);

export default router;
