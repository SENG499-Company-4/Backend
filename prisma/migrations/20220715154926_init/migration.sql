/*
  Warnings:

  - You are about to drop the column `peng` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyHours` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "peng",
DROP COLUMN "weeklyHours";

-- CreateTable
CREATE TABLE "CourseInfo" (
    "subject" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weeklyHours" DOUBLE PRECISION NOT NULL,
    "sequenceNumber" TEXT NOT NULL,
    "peng" "Peng" NOT NULL,

    CONSTRAINT "CourseInfo_pkey" PRIMARY KEY ("subject","code")
);
