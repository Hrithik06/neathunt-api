import { NextFunction, Request, Response } from "express";
import { ZodJSONSchema, ZodObject } from "zod";
import { ZodSchema } from "zod/v3";

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: result.error.flatten(),
      });
    }

    req.body = result.data; // ✅ sanitized + typed
    next();
  };
