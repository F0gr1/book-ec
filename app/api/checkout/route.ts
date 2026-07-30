import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAppUrl } from "@/app/lib/app-url";
import { parseCheckoutRequest } from "@/app/lib/checkout-validation";
import { getBookPreview } from "@/app/lib/microcms/client";
import { nextAuthOptions } from "@/app/lib/nexr-auth/options";
import prisma from "@/app/lib/prisma";
import { getStripe } from "@/app/lib/stripe";

export async function POST(request: Request) {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const checkoutRequest = parseCheckoutRequest(body);

    if (!checkoutRequest) {
        return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }

    try {
        const book = await getBookPreview(checkoutRequest.bookId);
        const amount = book.price;

        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return NextResponse.json({ error: "Book price is not configured" }, { status: 422 });
        }

        const existingPurchase = await prisma.purchase.findUnique({
            where: {
                userId_bookId: {
                    userId,
                    bookId: book.id,
                },
            },
            select: { id: true },
        });

        if (existingPurchase) {
            return NextResponse.json({ error: "Book already purchased" }, { status: 409 });
        }

        const checkoutSession = await getStripe().checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            client_reference_id: userId,
            metadata: {
                userId,
                bookId: book.id,
                amount: String(amount),
            },
            line_items: [
                {
                    price_data: {
                        currency: "jpy",
                        product_data: { name: book.title },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${getAppUrl()}/book/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${getAppUrl()}/`,
        });

        if (!checkoutSession.url) {
            return NextResponse.json({ error: "Checkout URL unavailable" }, { status: 502 });
        }

        return NextResponse.json({ url: checkoutSession.url });
    } catch {
        return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
    }
}
