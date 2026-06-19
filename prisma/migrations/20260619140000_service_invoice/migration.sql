-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'ISSUED', 'CANCELED');

-- CreateTable
CREATE TABLE "ServiceInvoice" (
    "id" TEXT NOT NULL,
    "number" TEXT,
    "series" TEXT,
    "recipientType" "RecipientType" NOT NULL DEFAULT 'PF',
    "document" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "email" TEXT,
    "serviceDesc" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceInvoice_pkey" PRIMARY KEY ("id")
);
