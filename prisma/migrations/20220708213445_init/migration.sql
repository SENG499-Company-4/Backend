/*
  Warnings:

  - You are about to drop the column `section` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subject,code,term,year]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Course_subject_code_term_year_section_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "section";

-- CreateTable
CREATE TABLE "Section" (
    "code" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_code_courseId_key" ON "Section"("code", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_subject_code_term_year_key" ON "Course"("subject", "code", "term", "year");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
