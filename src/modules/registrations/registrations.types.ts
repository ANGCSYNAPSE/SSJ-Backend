import { Entity } from "../../common/Repository";

/**
 * One resource for all 6 registration forms on the site (artist, dancer,
 * musician, temple, dharamshala, mandal) instead of six near-identical
 * CRUD sets — `type` says which form it came from, `details` holds the
 * fields specific to that form (temple address, dancer's dance style, ...).
 * The admin list screen filters by `type` and `status`.
 */
export type RegistrationType =
  | "artist"
  | "dancer"
  | "musician"
  | "temple"
  | "dharamshala"
  | "mandal";

export type RegistrationStatus = "pending" | "approved" | "rejected" | "blocked";

export interface Registration extends Entity {
  type: RegistrationType;
  status: RegistrationStatus;
  fullName: string;
  email: string;
  phone: string;
  /** Fields specific to `type` — e.g. temple address, dancer's style, mandal member count. */
  details: Record<string, unknown>;
  /** Uploaded file URLs (photos, documents) from POST /uploads. */
  attachments: string[];
  /** Internal note left by the admin when rejecting/blocking. */
  adminNote?: string;
}
