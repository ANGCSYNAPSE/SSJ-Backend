import { Router } from "express";
import { ApiError } from "../../common/ApiError";
import { asyncHandler } from "../../common/asyncHandler";
import { sendCreated } from "../../common/response";
import { requireAdmin } from "../../middleware/auth.middleware";
import { publicUrlForUpload, upload } from "../../middleware/upload.middleware";

/**
 * One shared upload endpoint used by every module that needs an image or
 * document — registration attachments, team member photos, ad creatives,
 * blog cover images, event images. Returns a `url` to store on the owning
 * resource (e.g. `Ad.imageUrl`, `TeamMember.photo`).
 * Mounted at /api/v1/uploads.
 *
 * @openapi
 * /uploads:
 *   post:
 *     tags: [Uploads]
 *     summary: "Admin: upload a file (image/PDF), get back its URL"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: "{ url, filename, mimeType, size }" }
 *       400: { description: No file, or unsupported type }
 */
export const uploadsRouter = Router();

uploadsRouter.post(
  "/",
  ...requireAdmin,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No file received (expected field name 'file')");
    sendCreated(res, {
      url: publicUrlForUpload(req.file.filename),
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  }),
);
