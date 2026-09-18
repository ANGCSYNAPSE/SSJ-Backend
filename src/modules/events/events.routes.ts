import { Router } from "express";
import { ApiError } from "../../common/ApiError";
import { asyncHandler } from "../../common/asyncHandler";
import { buildCrudRouter } from "../../common/crudRouter";
import { sendCreated, sendOk } from "../../common/response";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { requireAdmin } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { createEventSchema, createEventVolunteerSchema, updateEventSchema } from "./events.schema";
import { Event, EventVolunteer } from "./events.types";

export const eventsRepository = new JsonFileRepository<Event>("events");
export const eventVolunteersRepository = new JsonFileRepository<EventVolunteer>("event-volunteers");

/**
 * Mounted at /api/v1/events.
 * @openapi
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: List published events (public) or all events (admin)
 *     responses:
 *       200: { description: List of events }
 *   post:
 *     tags: [Events]
 *     summary: "Admin: create an event"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 * /events/{id}:
 *   patch:
 *     tags: [Events]
 *     summary: "Admin: edit an event"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Events]
 *     summary: "Admin: delete an event"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 * /events/{id}/publish:
 *   patch:
 *     tags: [Events]
 *     summary: "Admin: publish an event"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Published }
 */
export const eventsRouter = buildCrudRouter<Event>({
  repository: eventsRepository,
  createSchema: createEventSchema,
  updateSchema: updateEventSchema,
  publicListFilter: (event) => event.isPublished,
  statusActions: [
    { action: "publish", patch: { isPublished: true } },
    { action: "unpublish", patch: { isPublished: false } },
  ],
});

/**
 * Volunteer sign-ups for a specific event ("Register" button on the Events
 * page). Public: sign up. Admin: see who signed up for this event.
 * Mounted at /api/v1/events/:eventId/volunteers.
 */
export const eventVolunteersRouter = Router({ mergeParams: true });

/**
 * @openapi
 * /events/{eventId}/volunteers:
 *   post:
 *     tags: [Events]
 *     summary: Sign up to volunteer for an event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               message: { type: string }
 *     responses:
 *       201: { description: Signed up }
 *       404: { description: Event not found }
 *   get:
 *     tags: [Events]
 *     summary: "Admin: list volunteers who signed up for this event"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of volunteers }
 */
eventVolunteersRouter.post(
  "/",
  validateBody(createEventVolunteerSchema),
  asyncHandler(async (req, res) => {
    const event = await eventsRepository.findById(req.params.eventId);
    if (!event) throw ApiError.notFound("Event not found");
    const created = await eventVolunteersRepository.create({ ...req.body, eventId: event.id });
    sendCreated(res, created);
  }),
);

eventVolunteersRouter.get(
  "/",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const volunteers = await eventVolunteersRepository.list((v) => v.eventId === req.params.eventId);
    sendOk(res, volunteers);
  }),
);

/**
 * @openapi
 * /events/{eventId}/volunteers/{volunteerId}:
 *   delete:
 *     tags: [Events]
 *     summary: "Admin: remove a volunteer sign-up"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: volunteerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
eventVolunteersRouter.delete(
  "/:volunteerId",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const removed = await eventVolunteersRepository.remove(req.params.volunteerId);
    if (!removed) throw ApiError.notFound();
    res.status(204).send();
  }),
);
