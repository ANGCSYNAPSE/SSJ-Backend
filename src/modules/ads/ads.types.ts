import { Entity } from "../../common/Repository";

export type AdPlacement = "leaderboard" | "banner" | "rectangle";

export interface Ad extends Entity {
  placement: AdPlacement;
  /** Optional page slug to restrict where this ad shows; empty = every page. */
  page?: string;
  imageUrl: string;
  linkUrl?: string;
  ctaLabel?: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}
