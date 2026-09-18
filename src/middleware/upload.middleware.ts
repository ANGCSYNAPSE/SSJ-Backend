import { randomUUID } from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import { env } from "../config/env";
import { ApiError } from "../common/ApiError";

const UPLOAD_ROOT = path.join(__dirname, "..", "..", env.uploads.dir);

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
]);

function ensureUploadRoot() {
  if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadRoot();
    cb(null, UPLOAD_ROOT);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

/**
 * Shared file-upload middleware — used wherever a module accepts an image or
 * document (registration attachments, team member photos, ad creatives,
 * blog cover images, ...). Files land in `backend/uploads/` and are served
 * statically at `/uploads/<filename>` (see app.ts); a future database swap
 * only changes where the *URL* gets stored, not this middleware.
 */
export const upload = multer({
  storage,
  limits: { fileSize: env.uploads.maxMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

export function publicUrlForUpload(filename: string): string {
  return `/uploads/${filename}`;
}
