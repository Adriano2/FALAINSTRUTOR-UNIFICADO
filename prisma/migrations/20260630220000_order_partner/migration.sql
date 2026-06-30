-- Atribuição de venda ao parceiro white-label de origem
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "partnerSlug" TEXT;
