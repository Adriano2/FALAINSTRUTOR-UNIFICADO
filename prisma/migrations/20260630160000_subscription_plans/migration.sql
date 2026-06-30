-- Planos de assinatura corporativa (recorrência) + vínculo na empresa.
CREATE TABLE IF NOT EXISTS "Plan" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "priceMonthly" DOUBLE PRECISION NOT NULL,
  "maxEmployees" INTEGER,
  "features" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "highlight" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "planId" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "subscriptionRenewsAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "asaasSubscriptionId" TEXT;
DO $$ BEGIN
  ALTER TABLE "Company" ADD CONSTRAINT "Company_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
