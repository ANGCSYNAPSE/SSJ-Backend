import { z } from "zod";

export const updateSettingsSchema = z.object({
  contactEmail: z.string().trim().email().optional(),
  contactPhone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  socialLinks: z.array(z.object({ platform: z.string(), url: z.string() })).optional(),
});
