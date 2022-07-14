/*
  Warnings:

  - A unique constraint covering the columns `[id,subject,code,year,term]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseCode` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseSubject` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseTerm` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseYear` to the `Preference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Preference" ADD COLUMN     "courseCode" TEXT NOT NULL,
ADD COLUMN     "courseSubject" TEXT NOT NULL,
ADD COLUMN     "courseTerm" "Term" NOT NULL,
ADD COLUMN     "courseYear" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_id_subject_code_year_term_key" ON "Course"("id", "subject", "code", "year", "term");

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_courseID_courseCode_courseSubject_courseTerm_co_fkey" FOREIGN KEY ("courseID", "courseCode", "courseSubject", "courseTerm", "courseYear") REFERENCES "Course"("id", "code", "subject", "term", "year") ON DELETE RESTRICT ON UPDATE CASCADE;
