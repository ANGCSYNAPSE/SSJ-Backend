import bcrypt from "bcryptjs";
import { env } from "../../config/env";
import { findUserByEmail, usersRepository } from "./users.repository";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Creates the first admin account on boot, if no admin exists yet. */
export async function seedAdminIfMissing(): Promise<void> {
  const existing = await usersRepository.list((u) => u.role === "admin");
  if (existing.length > 0) return;

  const alreadyByEmail = await findUserByEmail(env.seedAdmin.email);
  if (alreadyByEmail) return;

  await usersRepository.create({
    fullName: env.seedAdmin.name,
    email: env.seedAdmin.email,
    mobile: "",
    passwordHash: await hashPassword(env.seedAdmin.password),
    role: "admin",
    isVerified: true,
    isBlocked: false,
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin account: ${env.seedAdmin.email}`);
}
