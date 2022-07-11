/*
  Warnings:

  - You are about to drop the column `scheduleID` on the `MeetingTime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[scheduleID]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scheduleID` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MeetingTime" DROP CONSTRAINT "MeetingTime_scheduleID_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "scheduleID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "MeetingTime" DROP COLUMN "scheduleID";

-- CreateIndex
CREATE UNIQUE INDEX "Course_scheduleID_key" ON "Course"("scheduleID");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_scheduleID_fkey" FOREIGN KEY ("scheduleID") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
