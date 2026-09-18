import { Entity } from "../../common/Repository";

/** A regional chapter shown on Team > State Team. The people in it live in team-members (section: state_leadership/district_member, keyed by stateSlug). */
export interface StateChapter extends Entity {
  name: string;
  slug: string;
  members: number;
  totalMembers?: string;
  districtsCovered?: string;
  established?: string;
}
