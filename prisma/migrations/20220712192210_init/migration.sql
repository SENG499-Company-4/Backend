/*
  Warnings:

  - A unique constraint covering the columns `[subject,code,year,term]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Course_subject_code_year_term_scheduleID_key";

-- CreateIndex
CREATE UNIQUE INDEX "Course_subject_code_year_term_key" ON "Course"("subject", "code", "year", "term");
