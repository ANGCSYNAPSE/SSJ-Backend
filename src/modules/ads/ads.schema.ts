import { z } from "zod";

const PLACEMENTS = ["leaderboard", "banner", "rectangle"] as const;

export const createAdSchema = z.object({
  placement: z.enum(PLACEMENTS),
  page: z.string().optional(),
  imageUrl: z.string().min(1, "imageUrl is required"),
  linkUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const updateAdSchema = z.object({
  placement: z.enum(PLACEMENTS).optional(),
  page: z.string().optional(),
  imageUrl: z.string().min(1).optional(),
  linkUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});
