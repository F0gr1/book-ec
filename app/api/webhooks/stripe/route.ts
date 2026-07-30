import { NextResponse } from "next/server";
import Stripe from "stripe";
import { validatePaidCheckout } from "@/app/lib/checkout-validation";
import prisma from "@/app/lib/prisma";
import { getStripe } from "@/app/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supportedEventTypes = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
]);

export async function POST(request: Request) {
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
        return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    if (!webhookSecret) {
        return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        const rawBody = await request.text();
        event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    if (!supportedEventTypes.has(event.type)) {
        return NextResponse.json({ received: true });
    }

    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    if (checkoutSession.payment_status !== "paid") {
        return NextResponse.json({ received: true, processed: false });
    }

    const verifiedCheckout = validatePaidCheckout({
        paymentStatus: checkoutSession.payment_status,
        amountTotal: checkoutSession.amount_total,
        currency: checkoutSession.currency,
        clientReferenceId: checkoutSession.client_reference_id,
        metadata: checkoutSession.metadata,
    });

    if (!verifiedCheckout || checkoutSession.mode !== "payment") {
        return NextResponse.json({ error: "Invalid checkout session" }, { status: 400 });
    }

    try {
        await prisma.$transaction(async (transaction) => {
            const eventInsert = await transaction.stripeWebhookEvent.createMany({
                data: {
                    id: event.id,
                    type: event.type,
                    createdAt: new Date(event.created * 1000),
                    processedAt: new Date(),
                },
                skipDuplicates: true,
            });

            if (eventInsert.count === 0) {
                return;
            }

            await transaction.purchase.createMany({
                data: [
                    {
                        userId: verifiedCheckout.userId,
                        bookId: verifiedCheckout.bookId,
                        stripeCheckoutSessionId: checkoutSession.id,
                        stripeEventId: event.id,
                        amount: verifiedCheckout.amount,
                        currency: checkoutSession.currency,
                    },
                ],
                skipDuplicates: true,
            });
        });
    } catch {
        // Return 5xx so Stripe retries after a transient database failure.
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
