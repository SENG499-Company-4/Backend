/*
  Warnings:

  - You are about to drop the column `professorId` on the `Section` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_professorId_fkey";

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "professorId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Section_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "_SectionToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SectionToUser_AB_unique" ON "_SectionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SectionToUser_B_index" ON "_SectionToUser"("B");

-- AddForeignKey
ALTER TABLE "_SectionToUser" ADD CONSTRAINT "_SectionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SectionToUser" ADD CONSTRAINT "_SectionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
