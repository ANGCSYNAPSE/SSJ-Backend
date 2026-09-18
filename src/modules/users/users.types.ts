import { Entity } from "../../common/Repository";
import { Role } from "../../common/jwt";

export interface User extends Entity {
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  isBlocked: boolean;
}

/** What ever gets sent to a client — never the password hash. */
export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}
