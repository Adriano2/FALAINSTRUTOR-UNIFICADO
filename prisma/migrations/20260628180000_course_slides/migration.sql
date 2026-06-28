-- AlterTable: deck de slides editável por curso
ALTER TABLE "Course" ADD COLUMN "slides" JSONB NOT NULL DEFAULT '[]';
