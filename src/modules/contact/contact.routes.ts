import { Router } from "express";
import { ApiError } from "../../common/ApiError";
import { asyncHandler } from "../../common/asyncHandler";
import { sendCreated, sendOk } from "../../common/response";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { requireAdmin } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { createContactSubmissionSchema } from "./contact.schema";
import { ContactSubmission } from "./contact.types";

export const contactRepository = new JsonFileRepository<ContactSubmission>("contact-submissions");

/** Mounted at /api/v1/contact. */
export const contactRouter = Router();

/**
 * @openapi
 * /contact:
 *   post:
 *     tags: [Contact]
 *     summary: Submit the Contact Us form
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               subject: { type: string }
 *               message: { type: string }
 *     responses:
 *       201: { description: Submitted }
 *   get:
 *     tags: [Contact]
 *     summary: "Admin: list contact submissions"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of submissions }
 */
contactRouter.post(
  "/",
  validateBody(createContactSubmissionSchema),
  asyncHandler(async (req, res) => {
    const created = await contactRepository.create({ ...req.body, isHandled: false });
    sendCreated(res, created);
  }),
);

contactRouter.get(
  "/",
  ...requireAdmin,
  asyncHandler(async (_req, res) => {
    const items = await contactRepository.list();
    sendOk(res, items);
  }),
);

/**
 * @openapi
 * /contact/{id}/handle:
 *   patch:
 *     tags: [Contact]
 *     summary: "Admin: mark a submission as handled"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Marked handled }
 */
contactRouter.patch(
  "/:id/handle",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await contactRepository.update(req.params.id, { isHandled: true });
    if (!updated) throw ApiError.notFound();
    sendOk(res, updated);
  }),
);

/**
 * @openapi
 * /contact/{id}:
 *   delete:
 *     tags: [Contact]
 *     summary: "Admin: delete a submission"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
contactRouter.delete(
  "/:id",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const removed = await contactRepository.remove(req.params.id);
    if (!removed) throw ApiError.notFound();
    res.status(204).send();
  }),
);
