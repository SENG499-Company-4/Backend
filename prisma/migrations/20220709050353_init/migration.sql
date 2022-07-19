/*
  Warnings:

  - You are about to drop the column `scheduleID` on the `MeetingTime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[professorId]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scheduleID` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MeetingTime" DROP CONSTRAINT "MeetingTime_scheduleID_fkey";

-- AlterTable
ALTER TABLE "MeetingTime" DROP COLUMN "scheduleID";

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "scheduleID" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Section_professorId_key" ON "Section"("professorId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_scheduleID_fkey" FOREIGN KEY ("scheduleID") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
