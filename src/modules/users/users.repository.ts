import { JsonFileRepository } from "../../db/JsonFileRepository";
import { User } from "./users.types";

export const usersRepository = new JsonFileRepository<User>("users");

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await usersRepository.list((u) => u.email.toLowerCase() === email.toLowerCase());
  return users[0];
}
