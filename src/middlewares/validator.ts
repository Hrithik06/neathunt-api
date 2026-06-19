import { NextFunction, Request, Response } from "express";
import { ZodType, z } from "zod";
import { fromError } from "zod-validation-error";

export const sendValidationError = (res: Response, error: z.ZodError) => {
  return res.status(400).json({
    message: "Validation failed",
    errors: z.flattenError(error),
  });
};
export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const validationError = fromError(result.error);

      console.log(validationError.toString());

      return sendValidationError(res, result.error);
    }

    req.body = result.data; // ✅ sanitized + typed
    next();
  };

export const validateQuery =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const validationError = fromError(result.error);

      console.log(validationError.toString());

      return sendValidationError(res, result.error);
    }

    // req.query = result.data; // ✅ use validated + typed data
    next();
  };
