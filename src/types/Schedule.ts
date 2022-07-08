import { PrismaClient } from '@prisma/client';
import { arg, extendType, inputObjectType, intArg, nonNull, objectType } from 'nexus';
import fetch from 'node-fetch';
import { CourseSection } from './Course/Section';
import { Date } from './Date';
import { MeetingTime } from './Course/MeetingTime';
import { Response } from './Response';
import { Term } from './Term';

export const GenerateScheduleInput = inputObjectType({
  name: 'GenerateScheduleInput',
  definition(t) {
    t.nonNull.int('year');
  },
});

export const Schedule = objectType({
  name: 'Schedule',
  description: 'Generated schedule for a year',
  definition(t) {
    t.nonNull.id('id', { description: 'ID of the schedule' });
    t.nonNull.int('year', { description: 'Year for the schedule' });
    t.nonNull.field('createdAt', { description: 'When the schedule was generated', type: Date });
    t.list.nonNull.field('courses', {
      type: CourseSection,
      description: 'Scheduled courses',
      args: {
        term: arg({ type: nonNull(Term) }),
      },
    });
  },
});

export const ScheduleMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('generateSchedule', {
      type: Response,
      description: 'Generate schedule',
      args: {
        input: arg({ type: nonNull(GenerateScheduleInput) }),
      },
      resolve: async (_, { input }, { prisma }) => {
        const courses_fall = await (prisma as PrismaClient).course.findMany({
          where: {
            year: input.year,
            term: 'FALL',
          },
        });
        const courses_spring = await (prisma as PrismaClient).course.findMany({
          where: {
            year: input.year,
            term: 'SPRING',
          },
        });
        const courses_summer = await (prisma as PrismaClient).course.findMany({
          where: {
            year: input.year,
            term: 'SUMMER',
          },
        });
        const fallTermCourses = courses_fall.map(({ id, subject, code, term, year, weeklyHours, capacity, professorId, startDate, endDate }) => {
            const meetingTimes = (prisma as PrismaClient).meetingTime.findMany({
              where: {
                courseID: id,
              },
            });
            // TODO build falltermcourses
        );

        const response = await fetch('https://seng499company4algorithm1.herokuapp.com/generate_schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            fallTermCourses: [
              {
                courseNumber: 'string',
                subject: 'string',
                sequenceNumber: 'string',
                courseTitle: 'string',
                requiredEquipment: ['string'],
                streamSequence: 'string',
                meetingTime: {
                  startDate: 'string',
                  endDate: 'string',
                  beginTime: 'string',
                  endtime: 'string',
                  hoursWeek: 0,
                  sunday: true,
                  monday: true,
                  tuesday: true,
                  wednesday: true,
                  thursday: true,
                  friday: true,
                  saturday: true,
                },
                prof: {
                  prefs: [
                    {
                      courseNum: 'string',
                      preferenceNum: 0,
                      term: 'string',
                    },
                  ],
                  displayName: 'string',
                  requiredEquipment: ['string'],
                  fallTermCourses: 0,
                  springTermCourses: 0,
                  summerTermCourses: 0,
                },
              },
            ],
            springTermCourses: [
              {
                courseNumber: 'string',
                subject: 'string',
                sequenceNumber: 'string',
                courseTitle: 'string',
                requiredEquipment: ['string'],
                streamSequence: 'string',
                meetingTime: {
                  startDate: 'string',
                  endDate: 'string',
                  beginTime: 'string',
                  endtime: 'string',
                  hoursWeek: 0,
                  sunday: true,
                  monday: true,
                  tuesday: true,
                  wednesday: true,
                  thursday: true,
                  friday: true,
                  saturday: true,
                },
                prof: {
                  prefs: [
                    {
                      courseNum: 'string',
                      preferenceNum: 0,
                      term: 'string',
                    },
                  ],
                  displayName: 'string',
                  requiredEquipment: ['string'],
                  fallTermCourses: 0,
                  springTermCourses: 0,
                  summerTermCourses: 0,
                },
              },
            ],
            summerTermCourses: [
              {
                courseNumber: 'string',
                subject: 'string',
                sequenceNumber: 'string',
                courseTitle: 'string',
                requiredEquipment: ['string'],
                streamSequence: 'string',
                meetingTime: {
                  startDate: 'string',
                  endDate: 'string',
                  beginTime: 'string',
                  endtime: 'string',
                  hoursWeek: 0,
                  sunday: true,
                  monday: true,
                  tuesday: true,
                  wednesday: true,
                  thursday: true,
                  friday: true,
                  saturday: true,
                },
                prof: {
                  prefs: [
                    {
                      courseNum: 'string',
                      preferenceNum: 0,
                      term: 'string',
                    },
                  ],
                  displayName: 'string',
                  requiredEquipment: ['string'],
                  fallTermCourses: 0,
                  springTermCourses: 0,
                  summerTermCourses: 0,
                },
              },
            ],
          }),
        });

        return { success: true, message: JSON.stringify(await response.json()) };
      },
    });
  },
});

export const ScheduleQuery = extendType({
  type: 'Query',
  definition(t) {
    t.string('schedule', {
      type: Schedule,
      description:
        'Schedule for a given term. If year is given, returns the most recent schedule generated for that year.',
      args: {
        year: intArg(),
      },
      resolve: async (_, { year }, { prisma }) => {
        const latestSchedule = await (prisma as PrismaClient).schedule.findFirst({
          where: {
            year:
              year || (await (prisma as PrismaClient).schedule.findMany({ orderBy: { createdAt: 'desc' } }))[0].year,
          },
        });

        // Return error if latest schedule does not exist
        if (!latestSchedule) {
          console.log('No schedule found for year ' + year);
          return;
        }

        // Fetch meeting times from the latest schedule
        const meetingTimes = await (prisma as PrismaClient).meetingTime.findMany({
          where: {
            schedule: {
              id: latestSchedule.id,
            },
          },
        });

        // Fetch courses from the latest schedule
        const courses = await (prisma as PrismaClient).course.findMany({
          where: {
            id: {
              in: meetingTimes.map((meetingTime) => meetingTime.courseID),
            },
          },
        });

        // Fetch profs for the course
        const users = await (prisma as PrismaClient).user.findMany({
          where: {
            id: {
              in: courses.map((course) => course.professorId),
            },
          },
        });

        // Return schedule object
        return {
          id: latestSchedule.id,
          year: latestSchedule.year,
          createdAt: latestSchedule.createdAt,
          courses: courses.map((course) => ({
            CourseID: {
              subject: course.subject,
              code: course.code,
              term: course.term,
              year,
            },
            hoursPerWeek: course.weeklyHours,
            capacity: course.capacity,
            professors: users.filter((prof) => prof.id === course.professorId),
            startDate: course.startDate,
            endDate: course.endDate,
            meetingTimes: meetingTimes.filter((meetingTime) => meetingTime.courseID === course.id),
          })),
        };
      },
    });
  },
});
