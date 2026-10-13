import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import { getStripeClient, processStripeWebhook } from "@/lib/stripe";
import type { StripeWebhookEvent } from "@/types/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    logger.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();

  let event: StripeWebhookEvent;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    ) as unknown as StripeWebhookEvent;
  } catch (error) {
    logger.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Log sewer-specific metadata for checkout completions
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { metadata?: Record<string, string> };
      if (session.metadata?.sewer_account) {
        logger.info("Sewer payment completed", {
          eventId: event.id,
          sewerAccount: session.metadata.sewer_account,
          customerName: session.metadata.customer_name,
          tierName: session.metadata.tier_name,
          paymentType: session.metadata.payment_type,
        });
      }
    }

    await processStripeWebhook(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Error processing Stripe webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
