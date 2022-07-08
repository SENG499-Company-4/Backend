/* eslint-disable camelcase */
import { arg, extendType, inputObjectType, intArg, nonNull, objectType } from 'nexus';
import fetch from 'node-fetch';
import { Course, PrismaClient } from '@prisma/client';
import { Algo1Course, Algorithm1Input, Algorithm2Input } from '../utils/types';
import { usePost } from '../utils/api';
import { prisma } from '../context';
import { Company } from './Company';
import { CourseInput } from './Course';
import { CourseSection } from './Course/Section';
import { Date } from './Date';
import { Response } from './Response';
import { Term } from './Term';

export const GenerateScheduleInput = inputObjectType({
  name: 'GenerateScheduleInput',
  definition(t) {
    t.nonNull.int('year');
    t.nonNull.field('term', { type: Term });
    t.list.field('courses', { type: nonNull(CourseInput) });
    t.nonNull.field('algorithm1', { type: Company });
    t.nonNull.field('algorithm2', { type: Company });
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
      resolve: async (_, { input: { algorithm1, algorithm2, courses, term, year } }) => {
        if (!courses) {
          return { success: false, message: 'No courses array passed' };
        }

        const algo1url =
          algorithm1 === 'COMPANY4'
            ? 'https://seng499company4algorithm1.herokuapp.com/generate_schedule'
            : "'https://seng499company4algorithm1.herokuapp.com/generate_schedule'";

        const algo2Url =
          algorithm2 === 'COMPANY3'
            ? 'https://algorithm-2.herokuapp.com/'
            : 'https://seng499company4algorithm2.herokuapp.com/';

        // Create or update the provided courses in the DB
        const newCourses: Course[] = [];
        courses.forEach(async ({ subject, code }) => {
          const newCourse = await (prisma as PrismaClient).course.upsert({
            create: {
              subject,
              code,
              term,
              year,
              peng: 'NOTREQUIRED',
              capacity: 0,
            },
            update: {
              subject,
              code,
              term,
              year,
              capacity: 0,
            },
            where: {
              subject_code_year_term: {
                code,
                term,
                year,
                subject,
              },
            },
          });
          newCourses.push(newCourse);
        });

        const courseInput: Algorithm2Input[] = newCourses.map(({ code, subject, capacity }) => {
          return {
            code,
            subject,
            seng_ratio: 0.75,
            semester: term,
            capacity: capacity ?? 0,
          };
        });

        const courseCapacities = await usePost<Algorithm2Input[], Algorithm2Input[]>(algo2Url, courseInput);

        console.log(courseCapacities);

        // Update capacities in the database
        courseCapacities.forEach(async ({ code, subject, semester, capacity }) => {
          await (prisma as PrismaClient).course.update({
            data: {
              capacity,
            },
            where: {
              subject_code_year_term: {
                code,
                term: semester,
                year,
                subject,
              },
            },
          });
        });

        const fallCourses: Algo1Course[] = term === 'FALL' ? [] : [];
        const summerCourses: Algo1Course[] = term === 'SUMMER' ? [] : [];
        const springCourses: Algo1Course[] = term === 'SPRING' ? [] : [];

        const generatedSchedule = await usePost<Algorithm1Input, Algorithm1Input>(algo1url, {
          fallCourses,
          summerCourses,
          springCourses,
        });

        console.log(generatedSchedule);

        if (term === 'FALL') {
          generatedSchedule.fallCourses.forEach(() => {
            console.log('fall');
          });
        }
        if (term === 'SPRING') {
          generatedSchedule.springCourses.forEach(() => {
            console.log('spring');
          });
        }
        if (term === 'SUMMER') {
          generatedSchedule.summerCourses.forEach(() => {
            console.log('summer');
          });
        }

        return { success: true };
      },
    });
  },
});

export const ScheduleQuery = extendType({
  type: 'Query',
  definition(t) {
    t.string('schedule', {
      // TODO: Revert this, just wanna return proof we connected to algo 2
      // type: Schedule,
      description:
        'Schedule for a given term. If year is given, returns the most recent schedule generated for that year.',
      args: {
        year: intArg(),
      },
      resolve: async () => {
        const response = await fetch('https://seng499company4algorithm2.herokuapp.com/predict_class_size', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify([
            {
              subject: 'SENG',
              code: '499',
              // eslint-disable-next-line camelcase
              seng_ratio: 0.75,
              semester: 'FALL',
              capacity: 45,
            },
          ]),
        });

        return JSON.stringify(await response.json());
      },
    });
  },
});
