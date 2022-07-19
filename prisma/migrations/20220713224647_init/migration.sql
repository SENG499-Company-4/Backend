/*
  Warnings:

  - The primary key for the `ProfessorSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ProfessorSettings" DROP CONSTRAINT "ProfessorSettings_pkey",
ADD CONSTRAINT "ProfessorSettings_pkey" PRIMARY KEY ("year", "userID");
