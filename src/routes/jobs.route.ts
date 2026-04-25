import { Router } from "express";
import {
  addJob,
  deleteJob,
  editJob,
  getAllJobs,
  filterJobs,
  seedJobsForUser,
} from "../controllers/jobs.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/all", authMiddleware, getAllJobs);
router.post("/", authMiddleware, addJob); //add job
router.patch("/:id", authMiddleware, editJob); //edit job
router.delete("/:id", authMiddleware, deleteJob); //delete job
router.get("/", authMiddleware, filterJobs); //handling query params
router.post("/seed", authMiddleware, seedJobsForUser); //seed jobs data for signed in user
export default router;
