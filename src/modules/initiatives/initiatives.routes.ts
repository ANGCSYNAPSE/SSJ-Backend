import { buildCrudRouter } from "../../common/crudRouter";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { createInitiativeSchema, updateInitiativeSchema } from "./initiatives.schema";
import { Initiative } from "./initiatives.types";

export const initiativesRepository = new JsonFileRepository<Initiative>("initiatives");

/**
 * Mounted at /api/v1/initiatives.
 *
 * @openapi
 * /initiatives:
 *   get:
 *     tags: [Content]
 *     summary: List "Our Initiatives" home page cards
 *     responses:
 *       200: { description: List of initiatives }
 *   post:
 *     tags: [Content]
 *     summary: "Admin: add an initiative"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 * /initiatives/{id}:
 *   patch:
 *     tags: [Content]
 *     summary: "Admin: edit an initiative"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Content]
 *     summary: "Admin: remove an initiative"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
export const initiativesRouter = buildCrudRouter<Initiative>({
  repository: initiativesRepository,
  createSchema: createInitiativeSchema,
  updateSchema: updateInitiativeSchema,
  publicListFilter: () => true,
});
