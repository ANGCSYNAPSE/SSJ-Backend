import { Router } from "express";
import { ApiError } from "../../common/ApiError";
import { asyncHandler } from "../../common/asyncHandler";
import { sendCreated, sendOk } from "../../common/response";
import { requireAdmin } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";
import { validateBody, validateQuery } from "../../middleware/validate.middleware";
import {
  createRegistrationSchema,
  registrationQuerySchema,
  updateRegistrationSchema,
} from "./registrations.schema";
import { registrationsRepository } from "./registrations.repository";

/**
 * Covers all 6 registration forms (artist, dancer, musician, temple,
 * dharamshala, mandal). Public: submit only. Everything else — list,
 * filter, view, edit, verify, reject, block, delete — is admin-only.
 * Mounted at /api/v1/registrations.
 */
export const registrationsRouter = Router();

/**
 * @openapi
 * /registrations/public:
 *   get:
 *     tags: [Registrations]
 *     summary: "Public: approved registrations by type — powers the Temple Directory, Artists, Dharamshala and Mandal listing pages"
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [artist, dancer, musician, temple, dharamshala, mandal] }
 *     responses:
 *       200: { description: Approved registrations of the given type }
 */
registrationsRouter.get(
  "/public",
  asyncHandler(async (req, res) => {
    const { type } = req.query as { type?: string };
    if (!type) throw ApiError.badRequest("type is required");
    const items = await registrationsRepository.list(
      (r) => r.type === type && r.status === "approved",
    );
    sendOk(
      res,
      items.map(({ adminNote: _adminNote, ...publicItem }) => publicItem),
    );
  }),
);

/**
 * @openapi
 * /registrations:
 *   post:
 *     tags: [Registrations]
 *     summary: Submit a registration (artist/dancer/musician/temple/dharamshala/mandal)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, fullName, email, phone]
 *             properties:
 *               type: { type: string, enum: [artist, dancer, musician, temple, dharamshala, mandal] }
 *               fullName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               details: { type: object, description: "Fields specific to `type`" }
 *               attachments: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Submitted, pending admin verification }
 */
registrationsRouter.post(
  "/",
  validateBody(createRegistrationSchema),
  asyncHandler(async (req, res) => {
    const created = await registrationsRepository.create({
      ...req.body,
      status: "pending",
    });
    sendCreated(res, created);
  }),
);

/**
 * @openapi
 * /registrations:
 *   get:
 *     tags: [Registrations]
 *     summary: "Admin: list registrations, optionally filtered by type/status"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [artist, dancer, musician, temple, dharamshala, mandal] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected, blocked] }
 *     responses:
 *       200: { description: List of registrations }
 */
registrationsRouter.get(
  "/",
  ...requireAdmin,
  validateQuery(registrationQuerySchema),
  asyncHandler(async (req, res) => {
    const { type, status } = req.query as { type?: string; status?: string };
    const items = await registrationsRepository.list(
      (r) => (!type || r.type === type) && (!status || r.status === status),
    );
    sendOk(res, items);
  }),
);

/**
 * @openapi
 * /registrations/{id}:
 *   get:
 *     tags: [Registrations]
 *     summary: "Admin: get one registration"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Registration detail }
 *       404: { description: Not found }
 */
registrationsRouter.get(
  "/:id",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await registrationsRepository.findById(req.params.id);
    if (!item) throw ApiError.notFound();
    sendOk(res, item);
  }),
);

/**
 * @openapi
 * /registrations/{id}:
 *   patch:
 *     tags: [Registrations]
 *     summary: "Admin: edit a registration's details"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
registrationsRouter.patch(
  "/:id",
  ...requireAdmin,
  validateBody(updateRegistrationSchema),
  asyncHandler(async (req, res) => {
    const updated = await registrationsRepository.update(req.params.id, req.body);
    if (!updated) throw ApiError.notFound();
    sendOk(res, updated);
  }),
);

function statusAction(action: string, status: "approved" | "rejected" | "blocked" | "pending") {
  registrationsRouter.patch(
    `/:id/${action}`,
    ...requireAdmin,
    asyncHandler(async (req, res) => {
      const updated = await registrationsRepository.update(req.params.id, {
        status,
        adminNote: typeof req.body?.adminNote === "string" ? req.body.adminNote : undefined,
      });
      if (!updated) throw ApiError.notFound();
      sendOk(res, updated);
    }),
  );
}

/**
 * @openapi
 * /registrations/{id}/verify:
 *   patch:
 *     tags: [Registrations]
 *     summary: "Admin: approve a registration (becomes visible on the public site, e.g. Temple/Artist directory)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Approved }
 */
statusAction("verify", "approved");

/**
 * @openapi
 * /registrations/{id}/reject:
 *   patch:
 *     tags: [Registrations]
 *     summary: "Admin: reject a registration"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Rejected }
 */
statusAction("reject", "rejected");

/**
 * @openapi
 * /registrations/{id}/block:
 *   patch:
 *     tags: [Registrations]
 *     summary: "Admin: block a previously-approved registration (removes it from the public site)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Blocked }
 */
statusAction("block", "blocked");

/**
 * @openapi
 * /registrations/{id}/unblock:
 *   patch:
 *     tags: [Registrations]
 *     summary: "Admin: restore a blocked registration back to approved"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Restored to approved }
 */
statusAction("unblock", "approved");

/**
 * @openapi
 * /registrations/{id}:
 *   delete:
 *     tags: [Registrations]
 *     summary: "Admin: permanently delete a registration"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
registrationsRouter.delete(
  "/:id",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const removed = await registrationsRepository.remove(req.params.id);
    if (!removed) throw ApiError.notFound();
    res.status(204).send();
  }),
);

// `upload` is exported so the router can be composed with a dedicated
// attachment-upload endpoint if a registration form needs it inline; the
// shared /uploads endpoint (src/modules/uploads) covers the common case.
export { upload as registrationUpload };
