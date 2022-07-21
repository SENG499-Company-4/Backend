import { PrismaClient, Term, Role, Peng } from '@prisma/client';
import { partition, randomNumber } from '../src/utils/helpers';
import courseData from './static/courses.json';
import courseInfo from './static/courseInfo.json';
import userData from './static/users.json';
const prisma = new PrismaClient();

async function main() {
  if ((await prisma.courseInfo.count()) === 0) {
    courseInfo.forEach(async ({ subject, sequence: sequenceNumber, code, peng, pengTerm, weeklyHours, title }) => {
      await (prisma as PrismaClient).courseInfo.create({
        data: {
          subject,
          code,
          peng: peng as Peng,
          pengTerm: pengTerm as Term,
          sequenceNumber,
          weeklyHours,
          title,
        },
      });
    });
  }

  const courses = courseData.filter(({ year, term }) => year === 2021 && term === 'FALL');

  if ((await prisma.course.count()) === 0) {
    for (const courseObj of courses) {
      await (prisma as PrismaClient).course.create({
        data: {
          subject: courseObj.subject,
          code: courseObj.code,
          term: courseObj.term as Term,
          year: courseObj.year,
          capacity: courseObj.capacity,
        },
      });
    }
  }

  if ((await prisma.user.count()) === 0) {
    for (const userObj of userData) {
      const dbCourses = await (prisma as PrismaClient).course.findMany();
      const preferences = dbCourses.map(({ id: courseID }) => ({
        courseID,
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
            create: preferences.map(({ courseID, rank }) => ({
              course: {
                connect: {
                  id: courseID,
                },
              },
              rank,
            })),
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
