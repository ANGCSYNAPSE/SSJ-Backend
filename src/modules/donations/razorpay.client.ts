/**
 * Server-only Razorpay client. KEY_SECRET and WEBHOOK_SECRET never leave
 * this module — only the order id/amount/currency/key id (all safe to
 * expose) are returned to the client. Ported from the frontend's
 * `lib/razorpay.ts`, which now delegates here (see donations.routes.ts).
 */
import crypto from "crypto";
import { env } from "../../config/env";

function requireSecret(name: "keyId" | "keySecret" | "webhookSecret"): string {
  const value = env.razorpay[name];
  if (!value) throw new Error(`Missing required env var for Razorpay ${name}`);
  return value;
}

function authHeader(): string {
  return "Basic " + Buffer.from(`${requireSecret("keyId")}:${requireSecret("keySecret")}`).toString("base64");
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
}

/** Creates an order. `amountInPaise` must be a positive integer. */
export async function createRazorpayOrder(params: {
  amountInPaise: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { amountInPaise, currency = "INR", receipt, notes } = params;

  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw new Error("amountInPaise must be a positive integer");
  }

  const res = await fetch(`${env.razorpay.apiBase}/orders`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountInPaise, currency, receipt, notes }),
  });

  const payload = (await res.json().catch(() => null)) as { error?: { description?: string } } | null;
  if (!res.ok) {
    const message = payload?.error?.description ?? "Failed to create Razorpay order";
    throw new Error(message);
  }
  return payload as RazorpayOrder;
}

/** Verifies the signature Razorpay Checkout returns after a successful payment. */
export function verifyPaymentSignature(params: { orderId: string; paymentId: string; signature: string }): boolean {
  const expected = crypto
    .createHmac("sha256", requireSecret("keySecret"))
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, params.signature);
}

/** Verifies the `X-Razorpay-Signature` header on an incoming webhook request. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto.createHmac("sha256", requireSecret("webhookSecret")).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(expectedHex: string, actualHex: string): boolean {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(actualHex ?? "", "hex");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}
