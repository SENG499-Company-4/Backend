/*
  Warnings:

  - Added the required column `professorUsername` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "professorUsername" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_professorUsername_fkey" FOREIGN KEY ("professorUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
