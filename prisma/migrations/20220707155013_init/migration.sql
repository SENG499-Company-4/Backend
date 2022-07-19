/*
  Warnings:

  - Made the column `capacity` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `hasRelief` to the `ProfessorSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasTopic` to the `ProfessorSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reliefReason` to the `ProfessorSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicDescription` to the `ProfessorSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peng` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_professorId_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "capacity" SET NOT NULL,
ALTER COLUMN "capacity" SET DEFAULT 0,
ALTER COLUMN "professorId" DROP NOT NULL,
ALTER COLUMN "professorId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProfessorSettings" ADD COLUMN     "hasRelief" BOOLEAN NOT NULL,
ADD COLUMN     "hasTopic" BOOLEAN NOT NULL,
ADD COLUMN     "reliefReason" TEXT NOT NULL,
ADD COLUMN     "topicDescription" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "peng" BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
