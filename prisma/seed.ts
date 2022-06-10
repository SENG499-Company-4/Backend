import { PrismaClient } from '@prisma/client';
import courseData from './course_migration.json';
const prisma = new PrismaClient();

async function main() {
  let courseId = 0;
  for (const courseObj of courseData) {
    const newCourse = await (prisma as PrismaClient).course.create({
      data: {
        id: courseId.toString(),
        subject: courseObj.subject,
        code: courseObj.code,
        term: courseObj.term as unknown as Term,
        year: courseObj.year,
        weeklyHours: courseObj.weeklyHours,
        capacity: courseObj.capacity,
        startDate: courseObj.startDate,
        endDate: courseObj.endDate,
        peng: courseObj.peng,
      },
    });
    courseId++;
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
