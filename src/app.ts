import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

import { adsRouter } from "./modules/ads/ads.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { blogCategoriesRouter, blogPostsRouter } from "./modules/blog/blog.routes";
import { contactRouter } from "./modules/contact/contact.routes";
import { donationContentRouter } from "./modules/donation-content/donation-content.routes";
import { donationsRouter, donationsWebhookRouter } from "./modules/donations/donations.routes";
import { eventVolunteersRouter, eventsRouter } from "./modules/events/events.routes";
import { initiativesRouter } from "./modules/initiatives/initiatives.routes";
import { registrationsRouter } from "./modules/registrations/registrations.routes";
import { settingsRouter } from "./modules/settings/settings.routes";
import { stateChaptersRouter } from "./modules/state-chapters/state-chapters.routes";
import { teamMembersRouter } from "./modules/team-members/team-members.routes";
import { teamProfilesRouter } from "./modules/team-profiles/team-profiles.routes";
import { uploadsRouter } from "./modules/uploads/uploads.routes";
import { usersRouter } from "./modules/users/users.routes";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(morgan(env.isProd ? "combined" : "dev"));

  // Razorpay's webhook needs the raw request body to verify its HMAC
  // signature, so it's mounted (with express.raw()) before the global JSON
  // body parser below — see donations.routes.ts for why.
  app.use(env.apiBasePath, donationsWebhookRouter);

  app.use(express.json());
  app.use(cookieParser());

  // Uploaded files (registration attachments, team photos, ad creatives, ...).
  app.use("/uploads", express.static(path.join(__dirname, "..", env.uploads.dir)));

  // API docs — raw OpenAPI spec (importable into SwaggerHub) + Swagger UI.
  app.get("/docs.json", (_req, res) => res.json(swaggerSpec));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  const api = express.Router();
  api.use("/auth", authRouter);
  api.use("/admin/users", usersRouter);
  api.use("/registrations", registrationsRouter);
  api.use("/team-members", teamMembersRouter);
  api.use("/team-profiles", teamProfilesRouter);
  api.use("/state-chapters", stateChaptersRouter);
  api.use("/ads", adsRouter);
  api.use("/initiatives", initiativesRouter);
  api.use("/blog-posts", blogPostsRouter);
  api.use("/blog-categories", blogCategoriesRouter);
  api.use("/events/:eventId/volunteers", eventVolunteersRouter);
  api.use("/events", eventsRouter);
  api.use("/donation-content", donationContentRouter);
  api.use("/donations", donationsRouter);
  api.use("/contact", contactRouter);
  api.use("/settings", settingsRouter);
  api.use("/uploads", uploadsRouter);

  app.use(env.apiBasePath, api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
