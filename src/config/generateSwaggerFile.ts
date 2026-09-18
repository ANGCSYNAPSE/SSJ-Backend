import fs from "fs";
import path from "path";
import { swaggerSpec } from "./swagger";

/**
 * Writes the OpenAPI spec to backend/openapi.json — run with
 * `npm run swagger:generate`. Import that file into SwaggerHub (or any
 * OpenAPI tool) instead of pointing it at a live server. The same spec is
 * also served live at GET /docs.json while the server is running.
 */
const outPath = path.join(__dirname, "..", "..", "openapi.json");
fs.writeFileSync(outPath, JSON.stringify(swaggerSpec, null, 2));
// eslint-disable-next-line no-console
console.log(`OpenAPI spec written to ${outPath}`);
