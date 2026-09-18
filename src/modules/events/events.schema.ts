import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().optional(),
  location: z.string().trim().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  type: z.string().trim().min(1),
  isPublished: z.boolean().default(false),
});

export const updateEventSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  image: z.string().optional(),
  location: z.string().trim().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.string().trim().min(1).optional(),
  isPublished: z.boolean().optional(),
});

export const createEventVolunteerSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  message: z.string().optional(),
});
