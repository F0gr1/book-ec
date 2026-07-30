DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Purchase"
        GROUP BY "userId", "bookId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate Purchase rows exist for the same userId/bookId; review and reconcile them before applying this migration';
    END IF;
END $$;

ALTER TABLE "Purchase"
    ADD COLUMN "stripeCheckoutSessionId" TEXT,
    ADD COLUMN "stripeEventId" TEXT,
    ADD COLUMN "amount" INTEGER,
    ADD COLUMN "currency" TEXT;

CREATE TABLE "stripe_webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Purchase_stripeCheckoutSessionId_key"
    ON "Purchase"("stripeCheckoutSessionId");

CREATE UNIQUE INDEX "Purchase_stripeEventId_key"
    ON "Purchase"("stripeEventId");

CREATE UNIQUE INDEX "Purchase_userId_bookId_key"
    ON "Purchase"("userId", "bookId");

CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");
