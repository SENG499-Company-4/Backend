import { PrismaClient, Term, Peng, Role } from '@prisma/client';
import courseData from './course_migration.json';
import userData from './user_seed.json';
const prisma = new PrismaClient();

async function main() {
  let courseId = 0;
  for (const userObj of userData) {
    await (prisma as PrismaClient).user.create({
      data: {
        name: userObj.name,
        username: userObj.username,
        password: userObj.password,
        role: userObj.role as Role,
      },
    });
  }
  for (const courseObj of courseData) {
    await (prisma as PrismaClient).course.create({
      data: {
        id: courseId.toString(),
        subject: courseObj.subject,
        code: courseObj.code,
        term: courseObj.term as Term,
        year: courseObj.year,
        weeklyHours: courseObj.weeklyHours,
        capacity: courseObj.capacity,
        startDate: new Date(courseObj.startDate),
        endDate: new Date(courseObj.endDate),
        peng: courseObj.peng as Peng,
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
