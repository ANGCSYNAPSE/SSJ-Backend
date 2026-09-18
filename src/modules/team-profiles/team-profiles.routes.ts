import { Router } from "express";
import { ApiError } from "../../common/ApiError";
import { asyncHandler } from "../../common/asyncHandler";
import { sendOk } from "../../common/response";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { requireAdmin } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { upsertTeamProfileSchema } from "./team-profiles.schema";
import { ProfileKey, TeamProfile } from "./team-profiles.types";

const teamProfilesRepository = new JsonFileRepository<TeamProfile>("team-profiles");

const VALID_KEYS: ProfileKey[] = ["chairman", "mukhya_trustee"];

/**
 * The two singleton bio pages (Chairman, Mukhya Trustee). Public GET,
 * admin-only PATCH which upserts (creates the profile the first time it's
 * edited). Mounted at /api/v1/team-profiles.
 */
export const teamProfilesRouter = Router();

/**
 * @openapi
 * /team-profiles/{key}:
 *   get:
 *     tags: [Team]
 *     summary: Get the Chairman or Mukhya Trustee profile page
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string, enum: [chairman, mukhya_trustee] }
 *     responses:
 *       200: { description: Profile }
 *       404: { description: Not yet created }
 */
teamProfilesRouter.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const key = req.params.key as ProfileKey;
    if (!VALID_KEYS.includes(key)) throw ApiError.badRequest("Invalid profile key");
    const [profile] = await teamProfilesRepository.list((p) => p.key === key);
    if (!profile) throw ApiError.notFound();
    sendOk(res, profile);
  }),
);

/**
 * @openapi
 * /team-profiles/{key}:
 *   patch:
 *     tags: [Team]
 *     summary: "Admin: create or update the Chairman or Mukhya Trustee profile"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string, enum: [chairman, mukhya_trustee] }
 *     responses:
 *       200: { description: Saved }
 */
teamProfilesRouter.patch(
  "/:key",
  ...requireAdmin,
  validateBody(upsertTeamProfileSchema),
  asyncHandler(async (req, res) => {
    const key = req.params.key as ProfileKey;
    if (!VALID_KEYS.includes(key)) throw ApiError.badRequest("Invalid profile key");

    const [existing] = await teamProfilesRepository.list((p) => p.key === key);
    if (existing) {
      const updated = await teamProfilesRepository.update(existing.id, req.body);
      return sendOk(res, updated);
    }
    const created = await teamProfilesRepository.create({ ...req.body, key });
    sendOk(res, created, 201);
  }),
);
