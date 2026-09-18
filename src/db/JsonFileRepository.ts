import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { Entity, Repository } from "../common/Repository";

const DATA_DIR = path.join(__dirname, "..", "..", "data");

/**
 * Temporary persistence layer: one JSON file per collection under
 * backend/data/. This exists purely so data survives a server restart
 * during development — it is NOT a database (no transactions, no
 * concurrent-write safety, no indexes) and is meant to be swapped out.
 *
 * To move to a real database later: implement `Repository<T>` with your
 * ORM/driver of choice (see src/db/README.md) and swap the constructor call
 * in the affected module's `*.repository.ts`. Every service/controller in
 * the app codes against the `Repository<T>` interface, not this class, so
 * nothing else changes.
 */
export class JsonFileRepository<T extends Entity> implements Repository<T> {
  private readonly filePath: string;
  private cache: T[] | null = null;

  constructor(private readonly collectionName: string) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
  }

  private readAll(): T[] {
    if (this.cache) return this.cache;
    if (!fs.existsSync(this.filePath)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(this.filePath, "[]", "utf-8");
    }
    const raw = fs.readFileSync(this.filePath, "utf-8");
    this.cache = raw.trim() ? (JSON.parse(raw) as T[]) : [];
    return this.cache;
  }

  private writeAll(items: T[]) {
    this.cache = items;
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), "utf-8");
  }

  /** Seeds the collection once, only if the file doesn't exist yet. */
  seedIfEmpty(items: T[]) {
    if (!fs.existsSync(this.filePath)) {
      this.writeAll(items);
    }
  }

  async list(predicate?: (item: T) => boolean): Promise<T[]> {
    const items = this.readAll();
    return predicate ? items.filter(predicate) : [...items];
  }

  async findById(id: string): Promise<T | undefined> {
    return this.readAll().find((item) => item.id === id);
  }

  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const now = new Date().toISOString();
    const entity = { ...data, id: randomUUID(), createdAt: now, updatedAt: now } as T;
    const items = this.readAll();
    items.push(entity);
    this.writeAll(items);
    return entity;
  }

  async update(id: string, patch: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<T | undefined> {
    const items = this.readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    const updated = { ...items[index], ...patch, updatedAt: new Date().toISOString() } as T;
    items[index] = updated;
    this.writeAll(items);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const items = this.readAll();
    const next = items.filter((item) => item.id !== id);
    if (next.length === items.length) return false;
    this.writeAll(next);
    return true;
  }
}
