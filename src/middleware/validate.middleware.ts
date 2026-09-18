import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../common/ApiError";

/** Validates `req.body` against `schema`; replaces it with the parsed (typed, defaulted) value. */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "(body)",
        message: issue.message,
      }));
      return next(ApiError.badRequest("Validation failed", errors));
    }
    req.body = result.data;
    next();
  };
}

/** Validates `req.query` against `schema`; replaces it with the parsed value. */
export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "(query)",
        message: issue.message,
      }));
      return next(ApiError.badRequest("Validation failed", errors));
    }
    // req.query is a getter-only object in newer Express/Node typings; cast to assign.
    (req as unknown as { query: unknown }).query = result.data;
    next();
  };
}
