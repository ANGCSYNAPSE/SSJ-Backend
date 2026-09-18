import { Entity } from "../../common/Repository";

export interface Event extends Entity {
  title: string;
  description: string;
  image?: string;
  location: string;
  startDate: string;
  endDate?: string;
  type: string;
  isPublished: boolean;
}

/** Someone who signed up to volunteer for a specific event — the "Register" button on the Events page. */
export interface EventVolunteer extends Entity {
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  message?: string;
}
