# Data layer

There is no real database wired up yet. Every module reads/writes through
the `Repository<T>` interface (`src/common/Repository.ts`), currently
implemented by `JsonFileRepository` — one JSON file per collection under
`backend/data/`. This keeps data across restarts during development without
requiring a database server, and keeps every module's code database-agnostic.

## Adding a real database later

1. Pick a driver/ORM (Prisma is the easiest fit for this structure — one
   model per collection, matching the `Entity`-shaped types already used
   everywhere).
2. Implement `Repository<T>` once per storage engine, e.g. `PrismaRepository<T>`
   in this folder, backed by `prisma.<model>.findMany / create / update / delete`.
3. In each module's `*.repository.ts` (e.g.
   `src/modules/registrations/registrations.repository.ts`), swap the single
   line that constructs `new JsonFileRepository(...)` for
   `new PrismaRepository(prisma.registration)` (or equivalent).
4. Nothing in a `*.controller.ts` or `*.service.ts` needs to change — they
   only ever depend on the `Repository<T>` interface, never on
   `JsonFileRepository` directly.
5. Set `DATABASE_URL` in `.env` and remove the `data/*.json` files.

Do this module-by-module; there's no requirement to migrate everything at
once since each module's repository is independent.
