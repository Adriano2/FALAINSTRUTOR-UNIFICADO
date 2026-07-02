-- Gamificacao: modulos ja premiados com XP na matricula
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "xpModulesAwarded" INTEGER NOT NULL DEFAULT 0;
