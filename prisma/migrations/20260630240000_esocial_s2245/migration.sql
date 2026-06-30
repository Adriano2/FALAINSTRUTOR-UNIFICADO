-- eSocial S-2245: marcação do curso e código do treinamento + CPF do responsável
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "esocialEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "esocialCode" TEXT;
ALTER TABLE "Instructor" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
