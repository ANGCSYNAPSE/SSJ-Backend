import { buildCrudRouter } from "../../common/crudRouter";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { createDonationContentSchema, updateDonationContentSchema } from "./donation-content.schema";
import { DonationContentBlock } from "./donation-content.types";

export const donationContentRepository = new JsonFileRepository<DonationContentBlock>("donation-content");

/**
 * Mounted at /api/v1/donation-content. Filter by `?type=cause` etc.
 * client-side — the collection is small.
 * @openapi
 * /donation-content:
 *   get:
 *     tags: [Donations]
 *     summary: List donation page content blocks (causes, testimonials, impact stats, breakdown)
 *     responses:
 *       200: { description: List of content blocks }
 *   post:
 *     tags: [Donations]
 *     summary: "Admin: add a content block"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 * /donation-content/{id}:
 *   patch:
 *     tags: [Donations]
 *     summary: "Admin: edit a content block"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Donations]
 *     summary: "Admin: remove a content block"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
export const donationContentRouter = buildCrudRouter<DonationContentBlock>({
  repository: donationContentRepository,
  createSchema: createDonationContentSchema,
  updateSchema: updateDonationContentSchema,
  publicListFilter: () => true,
});
