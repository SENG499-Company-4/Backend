-- AlterTable
ALTER TABLE "CourseInfo" ADD COLUMN     "pengTerm" "Term";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_code_subject_fkey" FOREIGN KEY ("code", "subject") REFERENCES "CourseInfo"("code", "subject") ON DELETE RESTRICT ON UPDATE CASCADE;
