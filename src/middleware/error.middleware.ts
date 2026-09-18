import { NextFunction, Request, Response } from "express";
import { ApiError } from "../common/ApiError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `No route: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, errors: err.errors });
    return;
  }

  const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
  if (!env.isProd) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(500).json({ message: env.isProd ? "Something went wrong. Please try again." : message });
}
