import { PrismaClient, Term, Peng, Role } from '@prisma/client';
import { partition, randomNumber } from '../src/utils/helpers';
import courseData from './static/courses.json';
import userData from './static/users.json';
const prisma = new PrismaClient();

async function main() {
  if ((await prisma.user.count()) === 0) {
    for (const userObj of userData) {
      const preferences = courseData.map((__, i) => ({
        courseID: i + 1,
        rank: randomNumber(6),
      }));

      // Randomly distribute either 5 or 3 courses across the 3 terms
      const { maxCoursesFall, maxCoursesSpring, maxCoursesSummer } = partition(randomNumber(8) > 4 ? 3 : 5);

      await (prisma as PrismaClient).user.create({
        data: {
          name: userObj.name,
          username: userObj.username,
          password: userObj.password,
          role: userObj.role as Role,
          peng: randomNumber(8) > 4,
          preferences: {
            create: preferences,
          },
          professorSettings: {
            create: [
              {
                year: 2021,
                maxCoursesFall,
                maxCoursesSpring,
                maxCoursesSummer,
                hasRelief: randomNumber(8) > 4,
                reliefReason: 'Release reason',
                hasTopic: randomNumber(8) > 4,
                topicDescription: 'TOPIC',
              },
            ],
          },
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
