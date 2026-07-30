import "server-only";

import Stripe from "stripe";

let stripe: Stripe | undefined;

export const getStripe = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
        throw new Error("Stripe is not configured");
    }

    stripe ??= new Stripe(secretKey);
    return stripe;
};
