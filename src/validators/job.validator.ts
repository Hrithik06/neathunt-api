import { z } from "zod";
import { Currency, JobSource, JobStatus } from "../types/jobs.js";
const nonEmptyString = z.string().trim().min(1);

export const createJobSchema = z
  .object({
    company: nonEmptyString,
    title: nonEmptyString,
    status: z.enum(JobStatus).optional(),
    notes: z.string().optional(),
    url: z.url().optional(),
    appliedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .transform((v) => new Date(v)), //Mandatory when data is coming from client not auto gmail

    platform: nonEmptyString.max(50).transform((v) => v.replace(/\s+/g, " ")), //"Pyjama  Jobs" → "Pyjama Jobs"
    salary: z.string().optional(),
    currency: z.enum(Currency).optional(),
  })
  .superRefine((data, ctx) => {
    const hasSalary = !!data.salary?.trim();
    const hasCurrency = data.currency != null;

    if (hasSalary && !hasCurrency) {
      ctx.addIssue({
        code: "custom",
        path: ["currency"],
        message: "Currency is required when salary is provided",
      });
    }

    if (!hasSalary && hasCurrency) {
      ctx.addIssue({
        code: "custom",
        path: ["salary"],
        message: "Salary is required when currency is provided",
      });
    }
  });

export const updateJobSchema = z
  .object({
    company: nonEmptyString.optional(),
    title: nonEmptyString.optional(),
    status: z.enum(JobStatus).optional(),
    notes: z.string().nullable().optional(), //recieve null from client to set null in db(deletes in db)
    url: z.url().nullable().optional(), //recieve null from client to set null in db(deletes in db)
    appliedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .transform((v) => new Date(v))
      .optional(),
    platform: nonEmptyString
      .max(50)
      .transform((v) => v.replace(/\s+/g, " ")) //"Pyjama  Jobs" → "Pyjama Jobs"
      .optional(),
    salary: z.string().nullable().optional(),
    currency: z.enum(Currency).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const hasSalary = !!data.salary?.trim();
    const hasCurrency = data.currency != null;

    if (hasSalary && !hasCurrency) {
      ctx.addIssue({
        code: "custom",
        path: ["currency"],
        message: "Currency is required when salary is provided",
      });
    }

    if (!hasSalary && hasCurrency) {
      ctx.addIssue({
        code: "custom",
        path: ["salary"],
        message: "Salary is required when currency is provided",
      });
    }
  });

export const filterJobSchema = z.object({
  company: nonEmptyString.optional(),
  status: z.enum(JobStatus).optional(),
  source: z.enum(JobSource).optional(),
  q: nonEmptyString.optional(), //search
});
export type FilterJobQuery = z.infer<typeof filterJobSchema>;
