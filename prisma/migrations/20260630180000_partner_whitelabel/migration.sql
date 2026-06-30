-- Parceiro white-label (marca por subdomínio).
CREATE TABLE IF NOT EXISTS "Partner" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "logoUrl" TEXT,
  "faviconUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#1E9B46',
  "secondaryColor" TEXT NOT NULL DEFAULT '#1F2A3A',
  "whatsappNumber" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Partner_slug_key" ON "Partner"("slug");
