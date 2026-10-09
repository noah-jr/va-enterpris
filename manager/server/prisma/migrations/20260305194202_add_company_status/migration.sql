-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "TrainingCourse" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "instructor" TEXT;
