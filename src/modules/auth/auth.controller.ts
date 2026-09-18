import { Response } from "express";
import { env } from "../../config/env";
import { AuthResult } from "./auth.service";

const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Sets the refresh token as an httpOnly cookie and returns only the access token + user in the body. */
export function sendAuthResult(res: Response, result: AuthResult, status = 200) {
  res.cookie(env.jwt.refreshCookieName, result.refreshToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/",
  });
  res.status(status).json({ data: { user: result.user, accessToken: result.accessToken } });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.jwt.refreshCookieName, { path: "/" });
}
