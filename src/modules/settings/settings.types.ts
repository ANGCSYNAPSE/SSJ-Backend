import { Entity } from "../../common/Repository";

/** Singleton — always exactly one row. Site-wide contact info & social links shown in the header/footer. */
export interface SiteSettings extends Entity {
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: { platform: string; url: string }[];
}
