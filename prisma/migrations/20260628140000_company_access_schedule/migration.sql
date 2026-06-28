-- AlterTable: restrição de horário de acesso por empresa
ALTER TABLE "Company" ADD COLUMN "accessSchedule" JSONB NOT NULL DEFAULT '{}';
