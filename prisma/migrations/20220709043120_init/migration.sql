-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_professorId_fkey";

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "professorId" DROP NOT NULL,
ALTER COLUMN "professorId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
