import { Router } from "express";
import express from "express";
import { ApiError } from "../../common/ApiError";
import { asyncHandler } from "../../common/asyncHandler";
import { sendCreated, sendOk } from "../../common/response";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import { requireAdmin } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { createDonationOrderSchema, verifyDonationSchema } from "./donations.schema";
import { Donation } from "./donations.types";
import { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } from "./razorpay.client";

export const donationsRepository = new JsonFileRepository<Donation>("donations");

/**
 * Real money flow — this is where the frontend's `/api/razorpay/*` Next.js
 * routes moved to (see donation/page.tsx on the frontend, which now calls
 * these instead). Order creation and signature verification are unchanged
 * from the original implementation; what's new is that a Donation record is
 * now actually persisted at every step instead of the old `// TODO: once a
 * donations table/backend exists...` placeholders.
 * Mounted at /api/v1/donations.
 */
export const donationsRouter = Router();

/**
 * @openapi
 * /donations/create-order:
 *   post:
 *     tags: [Donations]
 *     summary: Start a donation — creates a Razorpay order and a pending Donation record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, cause, donorName]
 *             properties:
 *               amount: { type: number, description: "Rupees, not paise" }
 *               cause: { type: string }
 *               donorName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               anonymous: { type: boolean }
 *               wantReceipt: { type: boolean }
 *     responses:
 *       201: { description: Order created }
 */
donationsRouter.post(
  "/create-order",
  validateBody(createDonationOrderSchema),
  asyncHandler(async (req, res) => {
    const { amount, cause, donorName, email, phone, anonymous, wantReceipt } = req.body;

    const order = await createRazorpayOrder({
      amountInPaise: Math.round(amount * 100),
      receipt: `donation_${Date.now()}`,
      notes: { cause, donor_name: donorName, anonymous: String(anonymous) },
    });

    await donationsRepository.create({
      amountInRupees: amount,
      cause,
      donorName,
      email,
      phone,
      anonymous,
      wantReceipt,
      razorpayOrderId: order.id,
      status: "created",
    });

    sendCreated(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  }),
);

/**
 * @openapi
 * /donations/verify:
 *   post:
 *     tags: [Donations]
 *     summary: Verify the Razorpay Checkout signature and mark the donation paid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id: { type: string }
 *               razorpay_payment_id: { type: string }
 *               razorpay_signature: { type: string }
 *     responses:
 *       200: { description: "{ verified: true }" }
 *       400: { description: Signature mismatch }
 */
donationsRouter.post(
  "/verify",
  validateBody(verifyDonationSchema),
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const verified = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!verified) {
      return res.status(400).json({ verified: false, message: "Signature mismatch" });
    }

    const [donation] = await donationsRepository.list((d) => d.razorpayOrderId === razorpay_order_id);
    if (donation) {
      await donationsRepository.update(donation.id, {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    sendOk(res, { verified: true });
  }),
);

/**
 * @openapi
 * /donations/feed:
 *   get:
 *     tags: [Donations]
 *     summary: Public recent-donors feed (anonymous donations show as "Anonymous")
 *     responses:
 *       200: { description: Recent paid donations }
 */
donationsRouter.get(
  "/feed",
  asyncHandler(async (_req, res) => {
    const paid = await donationsRepository.list((d) => d.status === "paid");
    const feed = paid
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20)
      .map((d) => ({
        name: d.anonymous ? "Anonymous" : d.donorName,
        amount: d.amountInRupees,
        cause: d.cause,
        time: d.createdAt,
      }));
    sendOk(res, feed);
  }),
);

/**
 * @openapi
 * /donations:
 *   get:
 *     tags: [Donations]
 *     summary: "Admin: list all donations"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [created, paid, failed] }
 *     responses:
 *       200: { description: List of donations }
 */
donationsRouter.get(
  "/",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.query as { status?: string };
    const items = await donationsRepository.list((d) => !status || d.status === status);
    sendOk(res, items);
  }),
);

/**
 * @openapi
 * /donations/{id}/receipt:
 *   get:
 *     tags: [Donations]
 *     summary: "Admin: get an 80G-style receipt record for a paid donation"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Receipt data }
 *       404: { description: Not found, or not yet paid }
 */
donationsRouter.get(
  "/:id/receipt",
  ...requireAdmin,
  asyncHandler(async (req, res) => {
    const donation = await donationsRepository.findById(req.params.id);
    if (!donation || donation.status !== "paid") throw ApiError.notFound();
    sendOk(res, {
      receiptNo: `SSJ-${donation.id.slice(0, 8).toUpperCase()}`,
      donorName: donation.anonymous ? "Anonymous" : donation.donorName,
      amountInRupees: donation.amountInRupees,
      cause: donation.cause,
      paidAt: donation.updatedAt,
      paymentId: donation.razorpayPaymentId,
    });
    // NOTE: this returns receipt data as JSON, not a rendered PDF. Wiring a
    // PDF template (e.g. pdfkit) is a small follow-up once the fields above
    // are confirmed against what the org's actual 80G receipt needs to show.
  }),
);

/**
 * Razorpay webhook needs the RAW request body to verify its HMAC signature,
 * so this route must be mounted with `express.raw()` BEFORE the app's
 * global `express.json()` middleware — see app.ts. Exported separately from
 * `donationsRouter` for that reason.
 */
export const donationsWebhookRouter = Router();

donationsWebhookRouter.post(
  "/donations/webhook",
  express.raw({ type: "*/*" }),
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = (req.body as Buffer).toString("utf-8");

    if (typeof signature !== "string" || !verifyWebhookSignature(rawBody, signature)) {
      throw ApiError.badRequest("Invalid webhook signature");
    }

    const event = JSON.parse(rawBody);
    const orderId: string | undefined = event?.payload?.payment?.entity?.order_id;
    const paymentId: string | undefined = event?.payload?.payment?.entity?.id;

    if (orderId) {
      const [donation] = await donationsRepository.list((d) => d.razorpayOrderId === orderId);
      if (donation) {
        const status = event.event === "payment.captured" ? "paid" : event.event === "payment.failed" ? "failed" : donation.status;
        await donationsRepository.update(donation.id, { status, razorpayPaymentId: paymentId ?? donation.razorpayPaymentId });
      }
    }

    sendOk(res, { received: true, event: event.event });
  }),
);
