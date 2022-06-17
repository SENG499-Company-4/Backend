/*
  Warnings:

  - The primary key for the `Preference` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userID` on the `Preference` table. All the data in the column will be lost.
  - The primary key for the `ProfessorSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userID` on the `ProfessorSettings` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - Added the required column `username` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `ProfessorSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_userID_fkey";

-- DropForeignKey
ALTER TABLE "ProfessorSettings" DROP CONSTRAINT "ProfessorSettings_userID_fkey";

-- AlterTable
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_pkey",
DROP COLUMN "userID",
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "Preference_pkey" PRIMARY KEY ("username", "courseID");

-- AlterTable
ALTER TABLE "ProfessorSettings" DROP CONSTRAINT "ProfessorSettings_pkey",
DROP COLUMN "userID",
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "ProfessorSettings_pkey" PRIMARY KEY ("username");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("username");

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorSettings" ADD CONSTRAINT "ProfessorSettings_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
