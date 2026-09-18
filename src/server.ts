import { createApp } from "./app";
import { env } from "./config/env";
import { seedInitialData } from "./db/seed";

async function main() {
  await seedInitialData();

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`SSJ backend listening on http://localhost:${env.port}`);
    // eslint-disable-next-line no-console
    console.log(`API base:   http://localhost:${env.port}${env.apiBasePath}`);
    // eslint-disable-next-line no-console
    console.log(`Swagger UI: http://localhost:${env.port}/docs`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
