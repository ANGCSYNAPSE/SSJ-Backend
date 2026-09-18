import { buildCrudRouter } from "../../common/crudRouter";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { createStateChapterSchema, updateStateChapterSchema } from "./state-chapters.schema";
import { StateChapter } from "./state-chapters.types";

export const stateChaptersRepository = new JsonFileRepository<StateChapter>("state-chapters");

/**
 * Mounted at /api/v1/state-chapters.
 *
 * @openapi
 * /state-chapters:
 *   get:
 *     tags: [Team]
 *     summary: List state chapters (Team > State Team overview)
 *     responses:
 *       200: { description: List of state chapters }
 *   post:
 *     tags: [Team]
 *     summary: "Admin: add a state chapter"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 * /state-chapters/{id}:
 *   patch:
 *     tags: [Team]
 *     summary: "Admin: edit a state chapter"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Team]
 *     summary: "Admin: remove a state chapter"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
export const stateChaptersRouter = buildCrudRouter<StateChapter>({
  repository: stateChaptersRepository,
  createSchema: createStateChapterSchema,
  updateSchema: updateStateChapterSchema,
  publicListFilter: () => true,
});
