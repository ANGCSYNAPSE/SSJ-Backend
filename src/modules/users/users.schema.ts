import { z } from "zod";

export const changeRoleSchema = z.object({
  role: z.enum(["member", "artist", "temple_admin", "admin"]),
});
