-- AlterTable
ALTER TABLE "Course" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "Course" ADD COLUMN "documents" JSONB NOT NULL DEFAULT '[]';
