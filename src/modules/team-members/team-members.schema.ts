import { z } from "zod";

const SECTIONS = ["trustee", "management", "advisory", "state_leadership", "district_member"] as const;

export const createTeamMemberSchema = z
  .object({
    section: z.enum(SECTIONS),
    name: z.string().trim().min(2),
    role: z.string().trim().min(2),
    photo: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    unit: z.string().optional(),
    order: z.number().int().default(0),
    stateSlug: z.string().optional(),
    districtName: z.string().optional(),
  })
  .refine((v) => (v.section !== "state_leadership" && v.section !== "district_member") || !!v.stateSlug, {
    message: "stateSlug is required for state_leadership and district_member",
    path: ["stateSlug"],
  })
  .refine((v) => v.section !== "district_member" || !!v.districtName, {
    message: "districtName is required for district_member",
    path: ["districtName"],
  });

export const updateTeamMemberSchema = z.object({
  section: z.enum(SECTIONS).optional(),
  name: z.string().trim().min(2).optional(),
  role: z.string().trim().min(2).optional(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  unit: z.string().optional(),
  order: z.number().int().optional(),
  stateSlug: z.string().optional(),
  districtName: z.string().optional(),
});
