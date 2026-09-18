import { Entity } from "../../common/Repository";

/**
 * One resource for every "person card" on the Team pages — Trustees,
 * Management Team, Advisory Board, plus each State's leadership and
 * district members — distinguished by `section` (and `stateSlug` /
 * `districtName` for the state-scoped ones). Chairman and Mukhya Trustee
 * are NOT here — they're full bio pages, see team-profiles.
 */
export type TeamSection =
  | "trustee"
  | "management"
  | "advisory"
  | "state_leadership"
  | "district_member";

export interface TeamMember extends Entity {
  section: TeamSection;
  name: string;
  role: string;
  photo?: string;
  bio?: string;
  location?: string;
  unit?: string;
  /** Display order within its section (and state/district, if scoped). */
  order: number;
  /** Required when section is state_leadership or district_member. */
  stateSlug?: string;
  /** Required when section is district_member. */
  districtName?: string;
}
