-- AlterTable: rastreamento de tempo por matrícula
ALTER TABLE "Enrollment" ADD COLUMN "firstAccessAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "watchedSeconds" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Enrollment" ADD COLUMN "examStartedAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "examFinishedAt" TIMESTAMP(3);

-- CreateTable: registro de logins (auditoria)
CREATE TABLE "LoginSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    CONSTRAINT "LoginSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginSession_userId_idx" ON "LoginSession"("userId");
CREATE INDEX "LoginSession_loginAt_idx" ON "LoginSession"("loginAt");

-- AddForeignKey
ALTER TABLE "LoginSession" ADD CONSTRAINT "LoginSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
