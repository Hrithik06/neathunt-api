import { NextFunction, Request, Response } from "express";
import { ZodType, z } from "zod";

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: z.treeifyError(result.error),
      });
    }

    req.body = result.data; // ✅ sanitized + typed
    next();
  };

export const validateQuery =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        // error: result.error.flatten(),
        error: z.treeifyError(result.error),
      });
    }

    next();
  };
