import { Router } from "express";
import {
  addJob,
  deleteJob,
  editJob,
  getAllJobs,
  filterJobs,
  seedJobsForUser,
  deleteAllJobDataOfUser,
} from "../controllers/jobs.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.js";
import { createJobSchema } from "../validators/job.validator.js";

const router = Router();

router.get("/", authMiddleware, getAllJobs); //get all jobs of user
router.post("/", authMiddleware, validate(createJobSchema), addJob); //add job
router.patch("/:id", authMiddleware, editJob); //edit job
router.delete("/:id", authMiddleware, deleteJob); //delete job
router.get("/", authMiddleware, filterJobs); //handling query params
router.post("/seed", authMiddleware, seedJobsForUser); //seed jobs data for signed in user
router.delete("/", authMiddleware, deleteAllJobDataOfUser); //delet all jobs data of signed in user
export default router;
