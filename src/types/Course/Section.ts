/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PrismaClient } from '@prisma/client';
import { arg, extendType, objectType } from 'nexus';
import { Date as ScalarDate } from '../Date';
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
    t.nonNull.field('startDate', { description: 'The start date of the course', type: ScalarDate });
    t.nonNull.field('endDate', { description: 'The end date of the course', type: ScalarDate });
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
      resolve: async (_, { term, year }, { prisma }) => {
        const courses = await (prisma as PrismaClient).course.findMany({
          where: { term: term ?? undefined, year: year ?? undefined },
        });
        // const meetingTimes = (
        //   await (prisma as PrismaClient).meetingTime.findMany({
        //     where: {
        //       sectionCourseId: {
        //         in: courses.map(({ id }) => id),
        //       },
        //     },
        //   })
        // ).map(({ sectionCourseId, day, startTime, endTime }) => ({
        //   courseID: {
        //     subject: courses.find(({ id }) => id === sectionCourseId)?.subject,
        //     code: courses.find(({ id }) => id === sectionCourseId)?.code,
        //     term: courses.find(({ id }) => id === sectionCourseId)?.term,
        //     year: courses.find(({ id }) => id === sectionCourseId)?.year,
        //   },
        //   day: day ?? 'SUNDAY',
        //   startTime,
        //   endTime,
        //   scheduleID: courses.find(({ id }) => id === sectionCourseId)?.scheduleID,
        // }));
        // Fetch sections for the course
        const sections = await (prisma as PrismaClient).section.findMany({
          where: {
            courseId: {
              in: courses.map(({ id }) => id),
            },
          },
        });

        const courseSections = await Promise.all(
          sections.map(async (section) => ({
            ...section,
            course: courses.find((course) => course.id === section.courseId),
            professor: await (prisma as PrismaClient).user.findMany({
              where: {
                id: section.professorId ?? 0,
              },
            }),
            meetingTimes: await (prisma as PrismaClient).meetingTime.findMany({
              where: {
                sectionCourseId: section.courseId,
              },
            }),
          }))
        );

        return courseSections.map(({ course, professor, meetingTimes }) => ({
          CourseID: {
            subject: course!.subject,
            code: course!.code,
            term: course!.term,
            year: year ?? 0,
          },
          hoursPerWeek: course!.weeklyHours ?? 0,
          capacity: course!.capacity ?? 0,
          professors: professor,
          startDate: course!.startDate ?? new Date(),
          endDate: course!.endDate ?? new Date(),
          meetingTimes: meetingTimes.map(({ id, sectionCourseId, day, startTime, endTime }) => ({
            id: id,
            courseID: sectionCourseId,
            day: day ?? 'SUNDAY',
            startTime: startTime,
            endTime: endTime,
            scheduleID: courses.find(({ id }) => id === sectionCourseId)?.scheduleID,
          })),
        }));
      },
    });
  },
});
