// import { z } from "zod";
// import { Currency, JobSource, JobStatus } from "../types/jobs.js";

// const nonEmptyString = (field: string) =>
//   z
//     .string({
//       error: `${field} is required`,
//     })
//     .trim()
//     .min(1, `${field} is required`);

// const optionalString = z
//   .string()
//   .trim()
//   .transform((v) => v || undefined)
//   .optional();

// const nullableString = z
//   .string()
//   .trim()
//   .transform((v) => v || null)
//   .nullable()
//   .optional();

// const dateString = z
//   .string()
//   .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
//   .transform((v) => new Date(v));

// const platformSchema = nonEmptyString("Platform")
//   .max(50, "Platform must be at most 50 characters")
//   .transform((v) => v.replace(/\s+/g, " "));

// const validateSalaryCurrency = (
//   data: {
//     salary?: string | null;
//     currency?: string | null;
//   },
//   ctx: z.RefinementCtx,
// ) => {
//   const hasSalary = !!data.salary?.trim();
//   const hasCurrency = data.currency != null;

//   if (hasSalary && !hasCurrency) {
//     ctx.addIssue({
//       code: "custom",
//       path: ["currency"],
//       message: "Currency is required when salary is provided",
//     });
//   }

//   if (!hasSalary && hasCurrency) {
//     ctx.addIssue({
//       code: "custom",
//       path: ["salary"],
//       message: "Salary is required when currency is provided",
//     });
//   }
// };
// export const createJobSchema = z.object({
//   company: nonEmptyString("Company"),
//   title: nonEmptyString("Title"),
//   status: z.enum(JobStatus).optional(),
//   notes: optionalString,
//   url: z.url().trim().optional(),
//   appliedAt: dateString, //Mandatory when data is coming from client not auto gmail

//   platform: platformSchema, //"Pyjama  Jobs" → "Pyjama Jobs"
//   salary: optionalString,
//   currency: z.enum(Currency).optional(),
// });

// export const updateJobSchema = z.object({
//   company: nonEmptyString("Company").optional(),
//   title: nonEmptyString("Title").optional(),
//   status: z.enum(JobStatus).optional(),
//   notes: nullableString, //recieve null from client to set null in db(deletes in db)
//   url: z.url().trim().nullable().optional(), //recieve null from client to set null in db(deletes in db)
//   appliedAt: dateString.optional(),
//   platform: platformSchema //"Pyjama  Jobs" → "Pyjama Jobs"
//     .optional(),
//   salary: nullableString,
//   currency: z.enum(Currency).nullable().optional(),
// });

// //Checking for both currency and salary
// createJobSchema.superRefine(validateSalaryCurrency);
// updateJobSchema.superRefine(validateSalaryCurrency);

// export const filterJobSchema = z.object({
//   company: optionalString,
//   status: z.enum(JobStatus).optional(),
//   source: z.enum(JobSource).optional(),
//   q: optionalString,
// });
// export type FilterJobQuery = z.infer<typeof filterJobSchema>;

import { z } from "zod";
import { Currency, JobSource, JobStatus } from "../types/jobs.js";
import { normalizePlatform } from "../utils/normalizePlatform.js";
import { createErrorMap } from "zod-validation-error";

z.config({
  customError: createErrorMap(),
});
/**
 * Required non-empty string.
 *
 * Handles:
 * - missing field -> "Company is required"
 * - empty string -> "Company is required"
 * - whitespace only -> "Company is required"
 *
 * Use for fields that MUST always exist.
 */
const nonEmptyString = (field: string) =>
  z
    .string({
      error: `${field} is required`,
    })
    .trim()
    .min(1, `${field} is required`);

/**
 * Optional text field.
 *
 * Server does NOT trust clients.
 *
 * Even if Postman sends:
 *
 * {
 *   notes: "      "
 * }
 *
 * this becomes:
 *
 * {
 *   notes: undefined
 * }
 *
 * Useful for:
 * - notes
 * - salary
 * - filter strings
 *
 * In CREATE:
 * undefined means:
 * -> user did not provide a value
 * -> DB stores NULL for nullable columns
 */
const optionalString = z
  .string()
  .trim()
  .transform((v) => v || undefined)
  .optional();

/**
 * Nullable text field used in UPDATE.
 *
 * UPDATE semantics:
 *
 * undefined
 * -> don't update this field
 *
 * null
 * -> explicitly remove existing value from DB
 *
 * string
 * -> update with new value
 *
 * Also protects against clients sending:
 *
 * {
 *   notes: "      "
 * }
 *
 * which becomes:
 *
 * {
 *   notes: null
 * }
 */
const nullableString = z
  .string()
  .trim()
  .transform((v) => v || null)
  .nullable()
  .optional();

/**
 * Accept only YYYY-MM-DD.
 *
 * We intentionally do NOT use z.coerce.date()
 * because it accepts many formats.
 *
 * We want:
 *
 * 2026-06-18 ✅
 *
 * Not:
 *
 * June 18 2026 ❌
 * 06/18/2026 ❌
 */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD")
  .transform((v) => new Date(v));

/**
 * Platform normalization.
 * Store canonical platform names in DB.
 *
 * Examples:
 *
 * "LinkedIn"
 * -> LINKEDIN
 *
 * "Pyjama Jobs"
 * -> PYJAMA_JOBS
 *
 * "  Insta   Hyre "
 * -> INSTA_HYRE
 *
 * Server performs normalization even if
 * client forgets to.
 */
const platformSchema = nonEmptyString("Platform")
  .max(50, "Platform must be at most 50 characters")
  .transform(normalizePlatform);
/**
 * Salary and currency must always exist together.
 *
 * Valid:
 *
 * salary + currency
 *
 * OR
 *
 * neither
 *
 * Invalid:
 *
 * salary without currency
 *
 * currency without salary
 *
 * This runs on BOTH create and update.
 *
 * Server validates this regardless of what client sends.
 */
const validateSalaryCurrency = (
  data: {
    salary?: string | null;
    currency?: string | null;
  },
  ctx: z.RefinementCtx,
) => {
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
};

export const createJobSchema = z
  .object({
    company: nonEmptyString("Company"),

    title: nonEmptyString("Title"),

    /**
     * Optional because DB has:
     *
     * status JobStatus @default(APPLIED)
     *
     * If client omits it,
     * DB automatically uses APPLIED.
     */
    status: z.enum(JobStatus).optional(),

    notes: optionalString,

    url: z.url().trim().optional(),

    /**
     * Mandatory for manual jobs.
     *
     * Gmail imported jobs may use a different schema.
     */
    appliedAt: dateString,

    platform: platformSchema,

    /**
     * Optional on CREATE.
     *
     * undefined means:
     * user didn't provide salary.
     */
    salary: optionalString,

    /**
     * Optional because salary itself is optional.
     *
     * validateSalaryCurrency ensures:
     *
     * salary + currency
     *
     * OR
     *
     * neither
     */
    currency: z.enum(Currency).optional(),
  })
  .superRefine(validateSalaryCurrency);

export const updateJobSchema = z
  .object({
    /**
     * Optional means:
     *
     * undefined
     * -> don't update company
     */
    company: nonEmptyString("Company").optional(),

    title: nonEmptyString("Title").optional(),

    status: z.enum(JobStatus).optional(),

    /**
     * UPDATE semantics:
     *
     * undefined
     * -> don't update
     *
     * null
     * -> remove existing value from DB
     *
     * string
     * -> update
     */
    notes: nullableString,

    /**
     * Same semantics as notes.
     */
    url: z.url().trim().nullable().optional(),

    appliedAt: dateString.optional(),

    platform: platformSchema.optional(),

    /**
     * UPDATE semantics:
     *
     * undefined
     * -> don't touch salary
     *
     * null
     * -> remove salary from DB
     *
     * string
     * -> update salary
     */
    salary: nullableString,

    /**
     * Must follow salary.
     *
     * validateSalaryCurrency guarantees:
     *
     * salary + currency
     *
     * OR
     *
     * neither
     */
    currency: z.enum(Currency).nullable().optional(),
  })
  .superRefine(validateSalaryCurrency);

/**
 * Filters are intentionally permissive.
 *
 * Empty query params become undefined.
 *
 * Example:
 *
 * ?company=
 *
 * becomes:
 *
 * company: undefined
 *
 * instead of throwing validation errors.
 */
export const filterJobSchema = z.object({
  company: optionalString,

  status: z.enum(JobStatus).optional(),

  source: z.enum(JobSource).optional(),

  q: optionalString,
});

export type FilterJobQuery = z.infer<typeof filterJobSchema>;
