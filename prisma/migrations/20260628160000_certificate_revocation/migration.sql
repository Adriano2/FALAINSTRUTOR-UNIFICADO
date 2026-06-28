-- AlterTable: revogação de certificado em 2 etapas
ALTER TABLE "Enrollment" ADD COLUMN "revocationRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Enrollment" ADD COLUMN "revocationRequestedBy" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "revocationReason" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "revocationRequestedAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "revoked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Enrollment" ADD COLUMN "revokedBy" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "revokedAt" TIMESTAMP(3);
