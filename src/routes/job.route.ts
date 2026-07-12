import { Router } from "express";
import * as jobController from "../controllers/job.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate, validateQuery } from "../middlewares/validator.js";
import {
  createJobSchema,
  filterJobSchema,
  updateJobSchema,
} from "../validators/job.validator.js";

const router = Router();

router.get("/", authMiddleware, validateQuery(filterJobSchema), jobController.getJobs);
router.post("/", authMiddleware, validate(createJobSchema), jobController.addJob); //add job
router.patch("/:id", authMiddleware, validate(updateJobSchema), jobController.editJob); //update job
router.delete("/:id", authMiddleware, jobController.deleteJob); //delete job
// router.post("/seed", authMiddleware, seedJobsForUser); //seed jobs data for signed in user
// router.delete("/", authMiddleware, deleteAllJobDataOfUser); //delete all jobs data of signed in user
export default router;
