import { z } from "zod";
import { Currency, JobSource, JobStatus } from "../types/jobs.js";

export const createJobSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(JobStatus).optional(),
  notes: z.string().optional(),
  url: z.url().optional(),
  appliedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((v) => new Date(v)), //Mandatory when data is coming from client not auto gmail

  platform: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform((v) => v.replace(/\s+/g, " ")), //"Pyjama  Jobs" → "Pyjama Jobs"
  salary: z.string().optional(),
  currency: z.enum(Currency).optional(),
});

export const updateJobSchema = z.object({
  company: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  status: z.enum(JobStatus).optional(),
  notes: z.string().nullable().optional(), //recieve null from client to set null
  url: z.url().nullable().optional(), //recieve null from client to set null
  appliedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((v) => new Date(v))
    .optional(),
  platform: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform((v) => v.replace(/\s+/g, " ")) //"Pyjama  Jobs" → "Pyjama Jobs"
    .optional(),
  salary: z.string().optional(),
  currency: z.enum(Currency).optional(),
});

export const filterJobSchema = z.object({
  company: z.string().min(1).optional(),
  status: z.enum(JobStatus).optional(),
  source: z.enum(JobSource).optional(),
  q: z.string().min(1).optional(), //search
});
export type FilterJobQuery = z.infer<typeof filterJobSchema>;
