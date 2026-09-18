import { NextFunction, Request, Response } from "express";
import { ApiError } from "../common/ApiError";
import { Role, verifyAccessToken } from "../common/jwt";

/** Requires a valid `Authorization: Bearer <token>` header; attaches `req.user`. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized());
  }
  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized("Session expired. Please log in again."));
  }
}

/** Use after `requireAuth`. Only allows the listed roles through. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}

export const requireAdmin = [requireAuth, requireRole("admin")];
