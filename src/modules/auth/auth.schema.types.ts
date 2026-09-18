import { z } from "zod";
import { loginSchema, signupSchema } from "./auth.schema";

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
