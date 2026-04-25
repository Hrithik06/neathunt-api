import { z } from "zod";
import { JobStatus } from "../types/jobs.js";

export const createJobSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(JobStatus).optional(),
  notes: z.string().optional(),
  url: z.url().optional(),
});
