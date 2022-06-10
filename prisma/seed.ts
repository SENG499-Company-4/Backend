import { PrismaClient } from '@prisma/client';
import * as courseData from './course_migration.json';
const prisma = new PrismaClient();

async function main() {
  for (const course of courseData) {
    console.log(`Seeding ${course.subject}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
