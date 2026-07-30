export type CheckoutRequest = {
    bookId: string;
};

export type VerifiedCheckout = {
    userId: string;
    bookId: string;
    amount: number;
};

export const parseCheckoutRequest = (
    input: unknown,
): CheckoutRequest | null => {
    if (typeof input !== "object" || input === null) {
        return null;
    }

    const bookId = (input as { bookId?: unknown }).bookId;

    if (
        typeof bookId !== "string" ||
        bookId.length === 0 ||
        bookId.length > 128
    ) {
        return null;
    }

    return { bookId };
};

export const validatePaidCheckout = (input: {
    paymentStatus: string;
    amountTotal: number | null;
    currency: string | null;
    clientReferenceId: string | null;
    metadata: Record<string, string> | null;
}): VerifiedCheckout | null => {
    if (
        input.paymentStatus !== "paid" ||
        input.amountTotal === null ||
        input.currency !== "jpy" ||
        !input.clientReferenceId ||
        !input.metadata
    ) {
        return null;
    }

    const { userId, bookId, amount: amountValue } = input.metadata;
    const amount = Number(amountValue);

    if (
        !userId ||
        !bookId ||
        !Number.isSafeInteger(amount) ||
        amount <= 0 ||
        input.amountTotal !== amount ||
        input.clientReferenceId !== userId
    ) {
        return null;
    }

    return { userId, bookId, amount };
};
