/*
  Warnings:

  - You are about to drop the column `scheduleID` on the `Section` table. All the data in the column will be lost.
  - Added the required column `scheduleID` to the `MeetingTime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_scheduleID_fkey";

-- DropIndex
DROP INDEX "Section_professorId_key";

-- AlterTable
ALTER TABLE "MeetingTime" ADD COLUMN     "scheduleID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "scheduleID";

-- AddForeignKey
ALTER TABLE "MeetingTime" ADD CONSTRAINT "MeetingTime_scheduleID_fkey" FOREIGN KEY ("scheduleID") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
