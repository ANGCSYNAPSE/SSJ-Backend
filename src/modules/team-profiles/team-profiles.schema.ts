import { z } from "zod";

export const upsertTeamProfileSchema = z.object({
  name: z.string().trim().min(2),
  title: z.string().trim().min(2),
  photo: z.string().optional(),
  quote: z.string().optional(),
  bio: z.string().default(""),
  milestones: z
    .array(z.object({ title: z.string(), year: z.string().optional(), desc: z.string().optional() }))
    .default([]),
  credentials: z.array(z.string()).default([]),
  socialLinks: z.array(z.object({ platform: z.string(), url: z.string() })).default([]),
});
