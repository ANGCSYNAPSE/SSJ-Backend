import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Prefer .env.local (matches the frontend's convention) and fall back to
// .env if that's what's present instead.
const rootDir = path.join(__dirname, "..", "..");
const localEnvPath = path.join(rootDir, ".env.local");
dotenv.config({ path: fs.existsSync(localEnvPath) ? localEnvPath : path.join(rootDir, ".env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 5000),
  apiBasePath: process.env.API_BASE_PATH ?? "/api/v1",

  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev_access_secret_change_me"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret_change_me"),
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "30d",
    refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? "ssj_refresh_token",
  },

  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@shreeshyamjagat.org",
    password: process.env.SEED_ADMIN_PASSWORD ?? "change_me_now",
    name: process.env.SEED_ADMIN_NAME ?? "Super Admin",
  },

  uploads: {
    dir: process.env.UPLOAD_DIR ?? "uploads",
    maxMb: Number(process.env.MAX_UPLOAD_MB ?? 8),
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? "",
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
    apiBase: process.env.RAZORPAY_API_BASE ?? "https://api.razorpay.com/v1",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
  },

  databaseUrl: process.env.DATABASE_URL ?? "",
};
