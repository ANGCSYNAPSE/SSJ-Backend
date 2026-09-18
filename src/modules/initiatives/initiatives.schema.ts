import { z } from "zod";

export const createInitiativeSchema = z.object({
  tag: z.string().trim().min(1),
  title: z.string().trim().min(1),
  desc: z.string().trim().min(1),
  image: z.string().min(1),
  order: z.number().int().default(0),
});

export const updateInitiativeSchema = z.object({
  tag: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  desc: z.string().trim().min(1).optional(),
  image: z.string().min(1).optional(),
  order: z.number().int().optional(),
});
