import { z } from "zod";

export const createContactSubmissionSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().trim().min(5),
});
