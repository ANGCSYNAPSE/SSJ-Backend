import { Entity } from "../../common/Repository";

export interface ContactSubmission extends Entity {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isHandled: boolean;
}
