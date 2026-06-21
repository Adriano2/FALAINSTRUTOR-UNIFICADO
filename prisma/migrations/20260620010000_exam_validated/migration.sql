ALTER TABLE "ExamSubmission" ADD COLUMN "validatedByInstructor" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ExamSubmission" ADD COLUMN "validatedAt" TIMESTAMP(3);
