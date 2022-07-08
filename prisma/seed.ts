import { PrismaClient, Term, Peng, Role, Day } from '@prisma/client';
import courseData from './static/courses.json';
import userData from './static/users.json';
import scheduleData from './static/schedules.json';
import meetingTimeData from './static/meetingTimes.json';
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
        },
      });
    }
  }
  if ((await prisma.schedule.count()) === 0) {
    for (const scheduleObj of scheduleData) {
      await (prisma as PrismaClient).schedule.create({
        data: {
          year: scheduleObj.year,
          createdAt: new Date(scheduleObj.createdAt),
        },
      });
    }
  }
  if ((await prisma.meetingTime.count()) === 0) {
    for (const meetingTimeObj of meetingTimeData) {
      await (prisma as PrismaClient).meetingTime.create({
        data: {
          courseID: meetingTimeObj.courseID,
          day: meetingTimeObj.day as Day,
          startTime: new Date(meetingTimeObj.startTime),
          endTime: new Date(meetingTimeObj.endTime),
          scheduleID: meetingTimeObj.scheduleID,
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
