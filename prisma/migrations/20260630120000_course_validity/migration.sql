-- Validade do certificado (em meses) por curso, para controle de vencimento e recompra.
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "validityMonths" INTEGER NOT NULL DEFAULT 12;
