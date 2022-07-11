/*
  Warnings:

  - You are about to drop the column `professorId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `courseID` on the `MeetingTime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subject,code,year,term]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Made the column `peng` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `sectionCode` to the `MeetingTime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionCourseId` to the `MeetingTime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_professorId_fkey";

-- DropForeignKey
ALTER TABLE "MeetingTime" DROP CONSTRAINT "MeetingTime_courseID_fkey";

-- DropIndex
DROP INDEX "Course_subject_code_term_year_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "professorId",
ALTER COLUMN "peng" SET NOT NULL;

-- AlterTable
ALTER TABLE "MeetingTime" DROP COLUMN "courseID",
ADD COLUMN     "sectionCode" TEXT NOT NULL,
ADD COLUMN     "sectionCourseId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "professorId" INTEGER NOT NULL DEFAULT 35;

-- CreateIndex
CREATE UNIQUE INDEX "Course_subject_code_year_term_key" ON "Course"("subject", "code", "year", "term");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTime" ADD CONSTRAINT "MeetingTime_sectionCode_sectionCourseId_fkey" FOREIGN KEY ("sectionCode", "sectionCourseId") REFERENCES "Section"("code", "courseId") ON DELETE RESTRICT ON UPDATE CASCADE;
