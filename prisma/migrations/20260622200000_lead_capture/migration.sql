-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('PERSON', 'COMPANY');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DISCARDED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "type" "LeadType" NOT NULL DEFAULT 'PERSON',
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "cnpj" TEXT,
    "employeeCount" INTEGER,
    "interest" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'landing',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
