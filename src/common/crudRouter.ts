import { Router } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "./ApiError";
import { asyncHandler } from "./asyncHandler";
import { Entity, Repository } from "./Repository";
import { sendCreated, sendNoContent, sendOk } from "./response";
import { requireAdmin } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";

export interface StatusAction<T> {
  /** URL segment, e.g. "verify" -> PATCH /:id/verify */
  action: string;
  /** Patch applied to the entity when this action is called. */
  patch: Partial<T> | ((existing: T) => Partial<T>);
}

export interface CrudRouterOptions<T extends Entity> {
  repository: Repository<T>;
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  /**
   * If set, GET list/:id are open to everyone and this predicate filters
   * what the public sees (e.g. only `status: "approved"` items). Admin
   * routes always see everything unfiltered. If omitted, GET is admin-only
   * like every other verb.
   */
  publicListFilter?: (item: T) => boolean;
  /** Named status-change shortcuts, e.g. verify/reject/block. Admin-only. */
  statusActions?: StatusAction<T>[];
}

/**
 * Builds a standard REST router (list, detail, create, update, delete) plus
 * any named status-transition routes, all backed by a `Repository<T>`. This
 * is what almost every module in this backend uses — see each module's
 * routes.ts file for how it's configured.
 */
export function buildCrudRouter<T extends Entity>(options: CrudRouterOptions<T>): Router {
  const router = Router();
  const { repository, createSchema, updateSchema, publicListFilter, statusActions = [] } = options;

  const listHandler = asyncHandler(async (req, res) => {
    const isPublic = Boolean(publicListFilter) && !req.user;
    const items = await repository.list(isPublic ? publicListFilter : undefined);
    sendOk(res, items);
  });

  const detailHandler = asyncHandler(async (req, res) => {
    const item = await repository.findById(req.params.id);
    if (!item) throw ApiError.notFound();
    const isPublic = Boolean(publicListFilter) && !req.user;
    if (isPublic && publicListFilter && !publicListFilter(item)) throw ApiError.notFound();
    sendOk(res, item);
  });

  if (publicListFilter) {
    // Open reads; write verbs below still require admin.
    router.get("/", listHandler);
    router.get("/:id", detailHandler);
  } else {
    router.get("/", ...requireAdmin, listHandler);
    router.get("/:id", ...requireAdmin, detailHandler);
  }

  router.post(
    "/",
    ...requireAdmin,
    validateBody(createSchema),
    asyncHandler(async (req, res) => {
      const created = await repository.create(req.body);
      sendCreated(res, created);
    }),
  );

  router.patch(
    "/:id",
    ...requireAdmin,
    validateBody(updateSchema),
    asyncHandler(async (req, res) => {
      const updated = await repository.update(req.params.id, req.body);
      if (!updated) throw ApiError.notFound();
      sendOk(res, updated);
    }),
  );

  for (const { action, patch } of statusActions) {
    router.patch(
      `/:id/${action}`,
      ...requireAdmin,
      asyncHandler(async (req, res) => {
        const existing = await repository.findById(req.params.id);
        if (!existing) throw ApiError.notFound();
        const resolvedPatch = typeof patch === "function" ? patch(existing) : patch;
        const updated = await repository.update(req.params.id, resolvedPatch);
        sendOk(res, updated);
      }),
    );
  }

  router.delete(
    "/:id",
    ...requireAdmin,
    asyncHandler(async (req, res) => {
      const removed = await repository.remove(req.params.id);
      if (!removed) throw ApiError.notFound();
      sendNoContent(res);
    }),
  );

  return router;
}
