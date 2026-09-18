import { Entity } from "../../common/Repository";

/**
 * One resource for every small editable block on the Donation page — causes,
 * testimonials, impact stats, donation breakdown slices — distinguished by
 * `type`, similar to how Registrations unifies its 6 forms. `data` holds
 * whatever fields that type needs (a cause has icon+label, a testimonial
 * has text+name+place, etc.) so the frontend just renders `data` directly.
 */
export type DonationContentType = "cause" | "testimonial" | "impact_stat" | "breakdown_slice";

export interface DonationContentBlock extends Entity {
  type: DonationContentType;
  order: number;
  data: Record<string, unknown>;
}
