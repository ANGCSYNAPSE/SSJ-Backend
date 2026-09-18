import { ApiError } from "../../common/ApiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../common/jwt";
import { findUserByEmail, usersRepository } from "../users/users.repository";
import { comparePassword, hashPassword } from "../users/users.service";
import { PublicUser, toPublicUser } from "../users/users.types";
import { LoginInput, SignupInput } from "./auth.schema.types";

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await usersRepository.create({
    fullName: input.fullName,
    email: input.email,
    mobile: input.mobile,
    passwordHash: await hashPassword(input.password),
    role: "member",
    isVerified: false,
    isBlocked: false,
  });

  return issueTokens(user.id, user.role, toPublicUser(user));
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (user.isBlocked) throw ApiError.forbidden("This account has been blocked. Contact support.");

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  return issueTokens(user.id, user.role, toPublicUser(user));
}

export async function refresh(refreshToken: string | undefined): Promise<AuthResult> {
  if (!refreshToken) throw ApiError.unauthorized("No refresh token");

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Refresh token expired. Please log in again.");
  }

  const user = await usersRepository.findById(payload.sub);
  if (!user || user.isBlocked) throw ApiError.unauthorized();

  return issueTokens(user.id, user.role, toPublicUser(user));
}

export async function me(userId: string): Promise<PublicUser> {
  const user = await usersRepository.findById(userId);
  if (!user) throw ApiError.unauthorized();
  return toPublicUser(user);
}

function issueTokens(userId: string, role: PublicUser["role"], user: PublicUser): AuthResult {
  return {
    user,
    accessToken: signAccessToken({ sub: userId, role }),
    refreshToken: signRefreshToken({ sub: userId, role }),
  };
}
