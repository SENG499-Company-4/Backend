/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Course, MeetingTime as PrismaMeetingTime, PrismaClient, Section, User as PrismaUser } from '@prisma/client';
import { arg, extendType, objectType } from 'nexus';
import { DateType as ScalarDate } from '../DateType';
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
    t.string('sectionNumber', { description: 'Section number for courses, eg: A01, A02' });
  },
});

export const CourseQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.nonNull.field('courses', {
      type: CourseSection,
      description: 'Get a list of courses for a given term and/or year',
      args: {
        term: arg({ type: Term }),
        year: arg({ type: 'Int' }),
      },
      resolve: async (_, { term, year }, { prisma }) => {
        const courses = await (prisma as PrismaClient).course.findMany({
          where: { term: term ?? undefined, year: year ?? undefined },
          include: {
            sections: {
              include: {
                professor: true,
                meetingTimes: true,
              },
            },
          },
        });

        const courseSections: (Section & {
          course: Course;
          professor: PrismaUser[];
          meetingTimes: PrismaMeetingTime[];
          hoursPerWeek?: number;
          title: string;
        })[] = [];
        courses.forEach(async (course) => {
          const courseInfo = await (prisma as PrismaClient).courseInfo.findUnique({
            where: {
              subject_code: {
                code: course.code,
                subject: course.subject,
              },
            },
          });
          course.sections.forEach((section) => {
            const courseSection = {
              ...section,
              course,
              professor: section.professor,
              meetingTimes: section.meetingTimes,
              hoursPerWeek: courseInfo?.weeklyHours,
              title: courseInfo?.title ?? '',
            };

            courseSections.push(courseSection);
          });
        });

        return courseSections.map(
          ({ course, professor, meetingTimes, startDate, endDate, code, hoursPerWeek, title }) => ({
            CourseID: {
              subject: course!.subject,
              code: course!.code,
              term: course!.term,
              year: year ?? 0,
              title,
            },
            hoursPerWeek: hoursPerWeek ?? 0,
            capacity: course!.capacity ?? 0,
            professors: professor,
            startDate: startDate,
            endDate: endDate,
            sectionNumber: code,
            meetingTimes: meetingTimes.map(({ id, sectionCourseId, day, startTime, endTime }) => ({
              id: id,
              courseID: sectionCourseId,
              day: day ?? 'SUNDAY',
              startTime: startTime,
              endTime: endTime,
              scheduleID: courses.find(({ id }) => id === sectionCourseId)?.scheduleID,
            })),
          })
        );
      },
    });
  },
});
