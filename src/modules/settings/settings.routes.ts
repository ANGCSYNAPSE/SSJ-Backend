import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { sendOk } from "../../common/response";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { requireAdmin } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { updateSettingsSchema } from "./settings.schema";
import { SiteSettings } from "./settings.types";

const settingsRepository = new JsonFileRepository<SiteSettings>("settings");

const DEFAULTS: Omit<SiteSettings, "id" | "createdAt" | "updatedAt"> = {
  contactEmail: "contact@shreeshyamjagat.org",
  contactPhone: "+91 1234 567 890",
  address: "123 Temple Road, Ramsagar, Bharat",
  socialLinks: [],
};

async function getOrCreateSettings(): Promise<SiteSettings> {
  const [existing] = await settingsRepository.list();
  if (existing) return existing;
  return settingsRepository.create(DEFAULTS);
}

/** Singleton site settings (contact info, social links). Mounted at /api/v1/settings. */
export const settingsRouter = Router();

/**
 * @openapi
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get site-wide contact info & social links
 *     responses:
 *       200: { description: Site settings }
 *   patch:
 *     tags: [Settings]
 *     summary: "Admin: update site-wide contact info & social links"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 */
settingsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    sendOk(res, await getOrCreateSettings());
  }),
);

settingsRouter.patch(
  "/",
  ...requireAdmin,
  validateBody(updateSettingsSchema),
  asyncHandler(async (req, res) => {
    const current = await getOrCreateSettings();
    const updated = await settingsRepository.update(current.id, req.body);
    sendOk(res, updated);
  }),
);
