import { z } from "zod";

export const createDonationOrderSchema = z.object({
  amount: z.number().positive("amount must be a positive number of rupees"),
  cause: z.string().trim().min(1),
  donorName: z.string().trim().min(2),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(7).optional(),
  anonymous: z.boolean().default(false),
  wantReceipt: z.boolean().default(true),
});

export const verifyDonationSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
