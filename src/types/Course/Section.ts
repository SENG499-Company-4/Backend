import { Course, PrismaClient } from '@prisma/client';
import { arg, extendType, objectType, list } from 'nexus';
import { Date } from '../Date';
import { Term } from '../Term';
import { User } from '../User';
import { CourseID } from './ID';
import { MeetingTime } from './MeetingTime';


const prisma = new PrismaClient();

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
      description: 'Get a list of courses for a given term',
      args: {
        term: arg({ type: Term }),
        year: arg({ type: 'Int' }),
      },
      resolve: async (_, args, ctx) => {
        const { term, year } = args;
        const { prisma } = ctx;
        
        let courses: Course[] = [];
        let courseSections: typeof CourseSection[]  = [];
        // if term and year are provided, get courses for that term
        if (term && year){
          courses = await (prisma as PrismaClient).course.findMany({
            where: {
              term: term,
              year: year,
            },
          });

        }
        else if (term){
          courses = await (prisma as PrismaClient).course.findMany({
            where: {
              term: term,
            },
          });
        }
        else if (year){
          courses = await (prisma as PrismaClient).course.findMany({
            where: {
              year: year,
            },
          });
        }
        else {
          courses = await (prisma as PrismaClient).course.findMany();
        }
        console.log(courses);
        // Get meeting times for each course
        for (const course of courses) {
          const meetingTimes = await (prisma as PrismaClient).meetingTime.findMany({
            where: {
              course: {
                id: course.id,
              },
            }
            });
            
         courseSections.push({
          courseID: {
              subject: course.subject,
              code: course.code,
              term: course.term,
              year: course.year
            },
            hoursPerWeek: course.weeklyHours,
            capacity: course.capacity,
            professors: course.professorUsername,
            startDate: course.startDate,
            endDate: course.endDate,
            meetingTimes: meetingTimes,
         }
        );
        }
        // Build CourseSection objects
        // courseSections = courses.map(course => ({
        //   CourseID: {
        //     subject: course.subject,
        //     code: course.code,
        //     term: course.term,
        //     year: course.year
        //   },
        //   hoursPerWeek: course.weeklyHours,
        //   capacity: course.capacity,
        //   professors: course.professor,
        //   startDate: course.startDate,
        //   endDate: course.endDate,
        //   meetingTimes: course.meetingTimes
        // }));

        return courseSections;
    }
    });
  },
});
