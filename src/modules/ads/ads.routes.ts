import { buildCrudRouter } from "../../common/crudRouter";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { createAdSchema, updateAdSchema } from "./ads.schema";
import { Ad } from "./ads.types";

export const adsRepository = new JsonFileRepository<Ad>("ads");

function isCurrentlyRunning(ad: Ad): boolean {
  if (!ad.isActive) return false;
  const now = Date.now();
  if (ad.startsAt && now < Date.parse(ad.startsAt)) return false;
  if (ad.endsAt && now > Date.parse(ad.endsAt)) return false;
  return true;
}

/**
 * Every AdSlot on the site (40+ placements) reads from here, filtered by
 * placement (leaderboard/banner/rectangle) client-side. Public GET only
 * returns ads that are active and within their date window; admin sees
 * everything and can add/edit/remove.
 * Mounted at /api/v1/ads.
 *
 * @openapi
 * /ads:
 *   get:
 *     tags: [Ads]
 *     summary: List currently-running ads (public) or all ads (admin)
 *     responses:
 *       200: { description: List of ads }
 *   post:
 *     tags: [Ads]
 *     summary: "Admin: add an ad"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [placement, imageUrl]
 *             properties:
 *               placement: { type: string, enum: [leaderboard, banner, rectangle] }
 *               page: { type: string }
 *               imageUrl: { type: string }
 *               linkUrl: { type: string }
 *               ctaLabel: { type: string }
 *               isActive: { type: boolean }
 *               startsAt: { type: string, format: date-time }
 *               endsAt: { type: string, format: date-time }
 *     responses:
 *       201: { description: Created }
 * /ads/{id}:
 *   patch:
 *     tags: [Ads]
 *     summary: "Admin: edit an ad"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Ads]
 *     summary: "Admin: remove an ad"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
export const adsRouter = buildCrudRouter<Ad>({
  repository: adsRepository,
  createSchema: createAdSchema,
  updateSchema: updateAdSchema,
  publicListFilter: isCurrentlyRunning,
});
