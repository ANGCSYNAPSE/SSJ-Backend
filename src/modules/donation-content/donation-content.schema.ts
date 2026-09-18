import { z } from "zod";

const TYPES = ["cause", "testimonial", "impact_stat", "breakdown_slice"] as const;

export const createDonationContentSchema = z.object({
  type: z.enum(TYPES),
  order: z.number().int().default(0),
  data: z.record(z.unknown()).default({}),
});

export const updateDonationContentSchema = z.object({
  type: z.enum(TYPES).optional(),
  order: z.number().int().optional(),
  data: z.record(z.unknown()).optional(),
});
