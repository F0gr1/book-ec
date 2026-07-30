import assert from "node:assert/strict";
import test from "node:test";
import {
  parseCheckoutRequest,
  validatePaidCheckout,
} from "../app/lib/checkout-validation";

test("checkout input accepts only a bookId", () => {
  assert.deepEqual(
    parseCheckoutRequest({
      bookId: "book-1",
      userId: "attacker",
      title: "Attacker title",
      price: 1,
    }),
    { bookId: "book-1" },
  );
});

test("checkout input rejects missing or oversized book IDs", () => {
  assert.equal(parseCheckoutRequest({ price: 1 }), null);
  assert.equal(parseCheckoutRequest({ bookId: "x".repeat(129) }), null);
});

test("paid checkout requires matching metadata, amount, currency, and user", () => {
  const valid = {
    paymentStatus: "paid",
    amountTotal: 1200,
    currency: "jpy",
    clientReferenceId: "user-1",
    metadata: { userId: "user-1", bookId: "book-1", amount: "1200" },
  };

  assert.deepEqual(validatePaidCheckout(valid), {
    userId: "user-1",
    bookId: "book-1",
    amount: 1200,
  });
  assert.equal(
    validatePaidCheckout({ ...valid, amountTotal: 1 }),
    null,
  );
  assert.equal(
    validatePaidCheckout({ ...valid, currency: "usd" }),
    null,
  );
  assert.equal(
    validatePaidCheckout({
      ...valid,
      metadata: { ...valid.metadata, userId: "other-user" },
    }),
    null,
  );
  assert.equal(
    validatePaidCheckout({ ...valid, paymentStatus: "unpaid" }),
    null,
  );
});
