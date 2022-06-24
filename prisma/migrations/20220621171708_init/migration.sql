/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `professorUsername` on the `Course` table. All the data in the column will be lost.
  - The `id` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MeetingTime` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `MeetingTime` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Preference` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `username` on the `Preference` table. All the data in the column will be lost.
  - The primary key for the `ProfessorSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `username` on the `ProfessorSettings` table. All the data in the column will be lost.
  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Schedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `courseID` on the `MeetingTime` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `scheduleID` on the `MeetingTime` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userID` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `ProfessorSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_professorUsername_fkey";

-- DropForeignKey
ALTER TABLE "MeetingTime" DROP CONSTRAINT "MeetingTime_courseID_fkey";

-- DropForeignKey
ALTER TABLE "MeetingTime" DROP CONSTRAINT "MeetingTime_scheduleID_fkey";

-- DropForeignKey
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_username_fkey";

-- DropForeignKey
ALTER TABLE "ProfessorSettings" DROP CONSTRAINT "ProfessorSettings_username_fkey";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "professorUsername",
ADD COLUMN     "professorId" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MeetingTime" DROP CONSTRAINT "MeetingTime_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "courseID",
ADD COLUMN     "courseID" INTEGER NOT NULL,
DROP COLUMN "scheduleID",
ADD COLUMN     "scheduleID" INTEGER NOT NULL,
ADD CONSTRAINT "MeetingTime_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_pkey",
DROP COLUMN "username",
ADD COLUMN     "userID" INTEGER NOT NULL,
ADD CONSTRAINT "Preference_pkey" PRIMARY KEY ("userID", "courseID");

-- AlterTable
ALTER TABLE "ProfessorSettings" DROP CONSTRAINT "ProfessorSettings_pkey",
DROP COLUMN "username",
ADD COLUMN     "userID" INTEGER NOT NULL,
ADD CONSTRAINT "ProfessorSettings_pkey" PRIMARY KEY ("userID");

-- AlterTable
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTime" ADD CONSTRAINT "MeetingTime_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTime" ADD CONSTRAINT "MeetingTime_scheduleID_fkey" FOREIGN KEY ("scheduleID") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorSettings" ADD CONSTRAINT "ProfessorSettings_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
