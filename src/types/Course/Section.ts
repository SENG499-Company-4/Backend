import { PrismaClient } from '@prisma/client';
import { arg, extendType, objectType } from 'nexus';
import { Date } from '../Date';
import { Term } from '../Term';
import { User } from '../User';
import { CourseID } from './ID';
import { MeetingTime } from './MeetingTime';

export const CourseSection = objectType({
  name: 'CourseSection',
  description: 'A set of CourseSections with matching CourseID represent a course offering',
  definition(t) {
    t.nonNull.field('CourseID', {
      type: CourseID,
      description: 'The course identifier',
    });
    t.nonNull.float('hoursPerWeek', { description: 'How many hours per week a course takes' });
    t.nonNull.int('capacity', { description: 'Maximum capacity of the section' });
    t.list.nonNull.field('professors', {
      type: User,
      description: "Professor's info, if any professors are assigned",
    });
    t.nonNull.field('startDate', { description: 'The start date of the course', type: Date });
    t.nonNull.field('endDate', { description: 'The end date of the course', type: Date });
    t.nonNull.list.nonNull.field('meetingTimes', {
      type: MeetingTime,
      description: 'Days of the week the class is offered in - see Day',
    });
  },
});

export const CourseQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.nonNull.field('courses', {
      // type is a list of coursesections
      type: CourseSection,
      description: 'Get a list of courses for a given term and/or year',
      args: {
        term: arg({ type: Term }),
        year: arg({ type: 'Int' }),
      },
      resolve: async (_, args, ctx) => {
        const { term, year } = args;
        const { prisma } = ctx;

        if (term && year) {
          return (await (prisma as PrismaClient).course.findMany({ where: { term, year } })).map(
            ({ id, subject, code, term, year, weeklyHours, capacity, professorId, startDate, endDate }) => {
              const meetingTimes = (prisma as PrismaClient).meetingTime.findMany({
                where: {
                  course: {
                    id,
                  },
                },
              });
              return {
                CourseID: {
                  subject,
                  code,
                  term,
                  year,
                },
                hoursPerWeek: weeklyHours,
                capacity,
                professors: professorId,
                startDate,
                endDate,
                meetingTimes,
              };
            }
          );
        }

        if (term) {
          return (await (prisma as PrismaClient).course.findMany({ where: { term } })).map(
            ({ id, subject, code, term, year, weeklyHours, capacity, professorId, startDate, endDate }) => {
              const meetingTimes = (prisma as PrismaClient).meetingTime.findMany({
                where: {
                  course: {
                    id,
                  },
                },
              });
              return {
                CourseID: {
                  subject,
                  code,
                  term,
                  year,
                },
                hoursPerWeek: weeklyHours,
                capacity,
                professors: professorId,
                startDate,
                endDate,
                meetingTimes,
              };
            }
          );
        }
        if (year) {
          return (await (prisma as PrismaClient).course.findMany({ where: { year } })).map(
            ({ id, subject, code, term, year, weeklyHours, capacity, professorId, startDate, endDate }) => {
              const meetingTimes = (prisma as PrismaClient).meetingTime.findMany({
                where: {
                  course: {
                    id,
                  },
                },
              });
              return {
                CourseID: {
                  subject,
                  code,
                  term,
                  year,
                },
                hoursPerWeek: weeklyHours,
                capacity,
                professors: professorId,
                startDate,
                endDate,
                meetingTimes,
              };
            }
          );
        }
        return (await (prisma as PrismaClient).course.findMany()).map(({ id, subject, code, term, year, weeklyHours, capacity, professorId, startDate, endDate }) => {
            const meetingTimes = (prisma as PrismaClient).meetingTime.findMany({
              where: {
                course: {
                  id,
                },
              },
            });
            return {
              CourseID: {
                subject,
                code,
                term,
                year,
              },
              hoursPerWeek: weeklyHours,
              capacity,
              professors: professorId,
              startDate,
              endDate,
              meetingTimes,
            };
          }
        );
      },
    });
  },
});
