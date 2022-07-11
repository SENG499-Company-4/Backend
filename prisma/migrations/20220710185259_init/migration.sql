-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_scheduleID_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "scheduleID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_scheduleID_fkey" FOREIGN KEY ("scheduleID") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
