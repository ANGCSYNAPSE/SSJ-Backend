# Shree Shyam Jagat — Backend

Standalone REST API for the site. Deployable separately from `frontend/` —
the frontend already talks to it as an external service (see
`frontend/src/lib/api.ts`, which hits `NEXT_PUBLIC_API_URL/api/v1/...`).

## Stack

- Node.js + Express + TypeScript
- Zod for request validation
- JWT (access + httpOnly-cookie refresh token) for auth
- Multer for file uploads
- swagger-jsdoc + swagger-ui-express for live docs, exportable to SwaggerHub
- A `Repository<T>` interface backed by JSON files on disk today — swappable
  for a real database later without touching any controller/service (see
  `src/db/README.md`)

## Getting started

```bash
cd backend
npm install
cp .env.example .env.local   # already present with dev defaults — edit as needed
npm run dev                   # http://localhost:5000
```

- API base: `http://localhost:5000/api/v1`
- Swagger UI: `http://localhost:5000/docs`
- Raw OpenAPI spec (import into SwaggerHub): `http://localhost:5000/docs.json`,
  or generate a static file with `npm run swagger:generate` → `backend/openapi.json`

On first boot it seeds an admin account (`SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in `.env.local`) plus the Initiatives and State
Chapters lists that mirror what's hardcoded in the frontend today. Everything
else (registrations, team members, ads, blog, events, donation content) starts
empty — add it through the admin-facing endpoints.

## Folder structure

```
src/
  app.ts                 # express app: middleware, route mounting
  server.ts               # entrypoint — seeds data, starts listening
  config/
    env.ts                 # typed env var access
    swagger.ts              # OpenAPI spec generation (reads @openapi JSDoc)
    generateSwaggerFile.ts  # writes openapi.json to disk
  common/                 # framework-agnostic building blocks
    ApiError.ts              # typed HTTP errors
    Repository.ts             # storage-agnostic data interface every module codes against
    crudRouter.ts              # generic list/detail/create/update/delete/status-action router builder
    response.ts                 # sendOk/sendCreated/paginate helpers
    asyncHandler.ts               # wraps async route handlers for the error middleware
    jwt.ts                          # sign/verify access + refresh tokens
  db/
    JsonFileRepository.ts     # today's Repository<T> implementation (one JSON file per collection)
    seed.ts                    # first-boot seed data
    README.md                   # how to swap in a real database later
  middleware/
    auth.middleware.ts        # requireAuth / requireRole / requireAdmin
    validate.middleware.ts      # Zod body/query validation
    upload.middleware.ts          # shared Multer config (images/PDFs → /uploads)
    error.middleware.ts             # 404 + central error handler
  modules/                 # one folder per resource — routes/controller/service/schema/types
    auth/                     # signup, login, refresh, logout, me
    users/                     # admin: list/block/unblock/change role
    registrations/               # unified: artist/dancer/musician/temple/dharamshala/mandal
    team-members/                  # trustees, management, advisory, state leadership, district members
    team-profiles/                   # Chairman & Mukhya Trustee bio pages (singletons)
    state-chapters/                    # Team > State Team list
    ads/                                 # every AdSlot on the site
    initiatives/                           # home page "Our Initiatives"
    blog/                                    # posts + categories
    events/                                    # events + per-event volunteer sign-ups
    donation-content/                            # causes/testimonials/impact stats/breakdown
    donations/                                     # Razorpay order/verify/webhook + persisted donations
    contact/                                         # Contact Us submissions
    settings/                                          # site-wide contact info & social links
    uploads/                                             # shared file upload endpoint
  types/
    express.d.ts            # augments Request with `user`
uploads/                  # uploaded files land here, served at /uploads/<name>
data/                     # JSON "database" files (gitignored) — see src/db/README.md
```

Every module follows the same internal shape:

```
<module>/
  <module>.types.ts      # the entity shape
  <module>.schema.ts     # Zod create/update schemas
  <module>.repository.ts # JsonFileRepository<T> instance (some modules skip this file
                          #   and construct it inline in .routes.ts when it's the only user)
  <module>.routes.ts      # Express router + @openapi JSDoc; either built with
                            #   buildCrudRouter() (most modules) or hand-written
                            #   where the module needs public-create/admin-manage
                            #   behavior (registrations, events, contact, donations)
```

## Auth model

- `POST /auth/signup` / `POST /auth/login` return `{ user, accessToken }` and
  set an httpOnly refresh cookie.
- `POST /auth/refresh` mints a new access token from that cookie.
- Every admin-only route requires `Authorization: Bearer <accessToken>` from
  a user whose `role` is `admin`. The very first admin is created by the
  seed step from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — log in with
  that, then use `PATCH /admin/users/:id/role` to promote anyone else.

## Adding a new module

1. Copy the shape of an existing simple module (`initiatives` is the
   smallest full example).
2. Define its entity in `<module>.types.ts` (extend `Entity`).
3. Define Zod create/update schemas in `<module>.schema.ts`.
4. Either call `buildCrudRouter()` in `<module>.routes.ts` (covers list/
   detail/create/update/delete/status-actions in ~10 lines), or hand-write
   the router if it needs public-create + admin-manage split like
   `registrations`.
5. Mount it in `src/app.ts`.

No separate "controller" layer was added on top of that — with a repository
this thin, a controller would just be a pass-through; routes call the
repository (or a small service, for auth/donations where there's real
business logic) directly.
