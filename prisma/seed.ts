import { PrismaClient, Term, Peng, Role } from '@prisma/client';
import courseData from './static/courses.json';
import userData from './static/users.json';
const prisma = new PrismaClient();

async function main() {
  if ((await prisma.user.count()) === 0) {
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
  }
  if ((await prisma.course.count()) === 0) {
    for (const courseObj of courseData) {
      await (prisma as PrismaClient).course.create({
        data: {
          subject: courseObj.subject,
          code: courseObj.code,
          term: courseObj.term as Term,
          year: courseObj.year,
          weeklyHours: courseObj.weeklyHours,
          capacity: courseObj.capacity,
          startDate: new Date(courseObj.startDate),
          endDate: new Date(courseObj.endDate),
          peng: courseObj.peng as Peng,
          // section: 'A01',
        },
      });
    }
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
