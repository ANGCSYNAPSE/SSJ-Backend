import { z } from "zod";

const REGISTRATION_TYPES = ["artist", "dancer", "musician", "temple", "dharamshala", "mandal"] as const;

export const createRegistrationSchema = z.object({
  type: z.enum(REGISTRATION_TYPES),
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  details: z.record(z.unknown()).default({}),
  attachments: z.array(z.string()).default([]),
});

export const updateRegistrationSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(7).optional(),
  details: z.record(z.unknown()).optional(),
  attachments: z.array(z.string()).optional(),
  adminNote: z.string().optional(),
});

export const registrationQuerySchema = z.object({
  type: z.enum(REGISTRATION_TYPES).optional(),
  status: z.enum(["pending", "approved", "rejected", "blocked"]).optional(),
});
