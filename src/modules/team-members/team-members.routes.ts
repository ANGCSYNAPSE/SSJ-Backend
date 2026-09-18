import { buildCrudRouter } from "../../common/crudRouter";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { createTeamMemberSchema, updateTeamMemberSchema } from "./team-members.schema";
import { TeamMember } from "./team-members.types";

export const teamMembersRepository = new JsonFileRepository<TeamMember>("team-members");

/**
 * Public reads (the whole point is that these render on public Team pages),
 * admin-only writes. Filter by `?section=` and, for state pages, `?stateSlug=`
 * client-side or via query — kept simple here since the collection is small.
 * Mounted at /api/v1/team-members.
 *
 * @openapi
 * /team-members:
 *   get:
 *     tags: [Team]
 *     summary: List team members (optionally add ?section= / ?stateSlug= client-side filtering)
 *     responses:
 *       200: { description: List of team members }
 *   post:
 *     tags: [Team]
 *     summary: "Admin: add a team member"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 * /team-members/{id}:
 *   patch:
 *     tags: [Team]
 *     summary: "Admin: edit a team member"
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
 *     summary: "Admin: remove a team member"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
export const teamMembersRouter = buildCrudRouter<TeamMember>({
  repository: teamMembersRepository,
  createSchema: createTeamMemberSchema,
  updateSchema: updateTeamMemberSchema,
  publicListFilter: () => true,
});
