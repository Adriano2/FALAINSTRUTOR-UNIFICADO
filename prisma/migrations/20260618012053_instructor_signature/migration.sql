-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "icpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signatureUrl" TEXT;
