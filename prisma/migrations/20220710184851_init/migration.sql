/*
  Warnings:

  - A unique constraint covering the columns `[id,year]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Schedule_id_year_key" ON "Schedule"("id", "year");
