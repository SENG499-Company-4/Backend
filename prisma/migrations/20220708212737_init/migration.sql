/*
  Warnings:

  - A unique constraint covering the columns `[subject,code,term,year,section]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `section` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "section" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_subject_code_term_year_section_key" ON "Course"("subject", "code", "term", "year", "section");
