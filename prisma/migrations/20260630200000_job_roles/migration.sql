-- Trilha por cargo/função (treinamentos obrigatórios por cargo).
CREATE TABLE IF NOT EXISTS "JobRole" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "courseCodes" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "jobRoleId" TEXT;
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
