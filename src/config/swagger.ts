import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env";

/**
 * Generates the OpenAPI 3.0 spec from the `@openapi` JSDoc comments in every
 * `*.routes.ts` file. Served at GET /docs.json (raw spec, importable into
 * SwaggerHub) and rendered at GET /docs (Swagger UI) — see app.ts.
 */
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Shree Shyam Jagat API",
      version: "1.0.0",
      description:
        "Standalone REST backend for the Shree Shyam Jagat site — registrations, team, ads, content, donations, and auth. " +
        "Every success response is `{ data: ... }` (optionally `{ data, meta }` for paginated lists).",
    },
    servers: [{ url: `http://localhost:${env.port}${env.apiBasePath}`, description: "Local dev" }],
    tags: [
      { name: "Auth" },
      { name: "Users" },
      { name: "Registrations" },
      { name: "Team" },
      { name: "Ads" },
      { name: "Content" },
      { name: "Blog" },
      { name: "Events" },
      { name: "Donations" },
      { name: "Contact" },
      { name: "Settings" },
      { name: "Uploads" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the accessToken returned by /auth/login or /auth/signup.",
        },
      },
    },
  },
  // Resolved relative to this file's own location so it works both from
  // `tsx src/server.ts` (reads *.routes.ts) and `node dist/server.js`
  // (reads the compiled *.routes.js, which still carries the JSDoc comments
  // since the build doesn't strip them). Forward slashes only — the glob
  // matcher treats a Windows backslash as an escape character, so
  // path.join's backslashes on Windows would silently match nothing.
  apis: [path.join(__dirname, "..", "modules/**/*.routes.{ts,js}").split(path.sep).join("/")],
});
