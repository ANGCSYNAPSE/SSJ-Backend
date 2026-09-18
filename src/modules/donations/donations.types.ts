import { Entity } from "../../common/Repository";

export type DonationStatus = "created" | "paid" | "failed";

export interface Donation extends Entity {
  amountInRupees: number;
  cause: string;
  donorName: string;
  email?: string;
  phone?: string;
  anonymous: boolean;
  wantReceipt: boolean;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: DonationStatus;
}
