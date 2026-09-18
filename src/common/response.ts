import { Response } from "express";

/**
 * Every success response is shaped `{ data }` (optionally with `meta` for
 * pagination) so the frontend's single `request<T>()` client — which reads
 * `payload.data` — works against every endpoint without special-casing.
 */
export function sendOk<T>(res: Response, data: T, status = 200, meta?: Record<string, unknown>) {
  res.status(status).json(meta ? { data, meta } : { data });
}

export function sendCreated<T>(res: Response, data: T) {
  sendOk(res, data, 201);
}

export function sendNoContent(res: Response) {
  res.status(204).send();
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; meta: PageMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    meta: { page, pageSize, total, totalPages },
  };
}
