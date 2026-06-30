-- Marca quando o alerta de vencimento foi enviado (evita reenvio).
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "expiryNotifiedAt" TIMESTAMP(3);
