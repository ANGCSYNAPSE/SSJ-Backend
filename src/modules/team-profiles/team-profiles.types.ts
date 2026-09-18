import { Entity } from "../../common/Repository";

/** The two singleton bio pages — Chairman and Mukhya Trustee — not grid cards, so not team-members. */
export type ProfileKey = "chairman" | "mukhya_trustee";

export interface TeamProfile extends Entity {
  key: ProfileKey;
  name: string;
  title: string;
  photo?: string;
  quote?: string;
  bio: string;
  milestones: { title: string; year?: string; desc?: string }[];
  credentials: string[];
  socialLinks: { platform: string; url: string }[];
}
