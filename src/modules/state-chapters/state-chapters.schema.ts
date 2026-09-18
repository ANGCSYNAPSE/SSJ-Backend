import { z } from "zod";

export const createStateChapterSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/, "slug must be lowercase, hyphen-separated"),
  members: z.number().int().min(0).default(0),
  totalMembers: z.string().optional(),
  districtsCovered: z.string().optional(),
  established: z.string().optional(),
});

export const updateStateChapterSchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/).optional(),
  members: z.number().int().min(0).optional(),
  totalMembers: z.string().optional(),
  districtsCovered: z.string().optional(),
  established: z.string().optional(),
});
