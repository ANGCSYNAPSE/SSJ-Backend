import { Router } from "express";
import { ApiError } from "../../common/ApiError";
import { asyncHandler } from "../../common/asyncHandler";
import { sendOk } from "../../common/response";
import { requireAdmin } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { usersRepository } from "./users.repository";
import { changeRoleSchema } from "./users.schema";
import { toPublicUser } from "./users.types";

/**
 * Admin-only user management: list, block/unblock, change role.
 * Mounted at /api/v1/admin/users — see src/app.ts.
 */
export const usersRouter = Router();

usersRouter.get(
  "/",
  ...requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await usersRepository.list();
    sendOk(res, users.map(toPublicUser));
  }),
);

usersRouter.patch(
  "/:id/block",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await usersRepository.update(req.params.id, { isBlocked: true });
    if (!updated) throw ApiError.notFound();
    sendOk(res, toPublicUser(updated));
  }),
);

usersRouter.patch(
  "/:id/unblock",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await usersRepository.update(req.params.id, { isBlocked: false });
    if (!updated) throw ApiError.notFound();
    sendOk(res, toPublicUser(updated));
  }),
);

usersRouter.patch(
  "/:id/role",
  ...requireAdmin,
  validateBody(changeRoleSchema),
  asyncHandler(async (req, res) => {
    const updated = await usersRepository.update(req.params.id, { role: req.body.role });
    if (!updated) throw ApiError.notFound();
    sendOk(res, toPublicUser(updated));
  }),
);
