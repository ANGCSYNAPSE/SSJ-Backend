export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Storage-agnostic contract every module's service codes against. Today it's
 * backed by `JsonFileRepository` (see src/db). Swapping to a real database
 * later means writing one new class that implements this interface — e.g.
 * `PrismaRepository<T>` — and changing the single line in each module's
 * `*.repository.ts` that constructs it. Nothing in a controller or service
 * needs to change.
 */
export interface Repository<T extends Entity> {
  list(predicate?: (item: T) => boolean): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<T | undefined>;
  remove(id: string): Promise<boolean>;
}
