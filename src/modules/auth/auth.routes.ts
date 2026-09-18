import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { env } from "../../config/env";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { clearAuthCookie, sendAuthResult } from "./auth.controller";
import { loginSchema, signupSchema } from "./auth.schema";
import * as authService from "./auth.service";

export const authRouter = Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new member account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, mobile, email, password, confirmPassword, acceptTerms]
 *             properties:
 *               fullName: { type: string }
 *               mobile: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               confirmPassword: { type: string, format: password }
 *               acceptTerms: { type: boolean }
 *     responses:
 *       201: { description: Account created }
 *       409: { description: Email already registered }
 */
authRouter.post(
  "/signup",
  validateBody(signupSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);
    sendAuthResult(res, result, 201);
  }),
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               remember: { type: boolean }
 *     responses:
 *       200: { description: Logged in }
 *       401: { description: Invalid credentials }
 */
authRouter.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    sendAuthResult(res, result);
  }),
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange the httpOnly refresh cookie for a new access token
 *     responses:
 *       200: { description: New access token issued }
 *       401: { description: Refresh token missing or expired }
 */
authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[env.jwt.refreshCookieName];
    const result = await authService.refresh(token);
    sendAuthResult(res, result);
  }),
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Clear the refresh session
 *     responses:
 *       200: { description: Logged out }
 */
authRouter.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    clearAuthCookie(res);
    res.status(200).json({ data: null });
  }),
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Not authenticated }
 */
authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.me(req.user!.id);
    res.status(200).json({ data: { user } });
  }),
);
