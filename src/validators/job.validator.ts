import { z } from "zod";
import { JobSource, JobStatus } from "../types/jobs.js";

export const createJobSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(JobStatus).optional(),
  notes: z.string().optional(),
  url: z.url().optional(),
});

export const updateJobSchema = z.object({
  company: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  status: z.enum(JobStatus).optional(),
  notes: z.string().optional(),
  url: z.url().optional(),
  appliedDate: z.date().optional(),
});

export const filterJobSchema = z.object({
  company: z.string().min(1).optional(),
  status: z.enum(JobStatus).optional(),
  source: z.enum(JobSource).optional(),
});
