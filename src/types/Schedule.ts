import { arg, extendType, inputObjectType, intArg, nonNull, objectType } from 'nexus';
import fetch from 'node-fetch';
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
      resolve: async (_, { input: { algorithm1 } }) => {
        // TODO: Replace second url with correct one for company 3 algorithm 1
        const url =
          algorithm1 === 'COMPANY4'
            ? 'https://seng499company4algorithm1.herokuapp.com/generate_schedule'
            : "'https://seng499company4algorithm1.herokuapp.com/generate_schedule'";

        // const fallCourses =
        //   term === 'FALL'
        //     ? (prisma as PrismaClient).course.findMany({
        //         where: {
        //           term: 'FALL',
        //         },
        //       })
        //     : [];

        // const springCourses =
        //   term === 'SPRING'
        //     ? (prisma as PrismaClient).course.findMany({
        //         where: {
        //           term: 'SPRING',
        //         },
        //       })
        //     : [];

        // const summerCourses =
        //   term === 'SUMMER'
        //     ? (
        //         await (prisma as PrismaClient).course.findMany({
        //           where: {
        //             term: 'SUMMER',
        //           },
        //         })
        //       ).map((course) => {
        //         const meetingTime = (prisma as PrismaClient).meetingTime.findMany({});

        //         return {
        //           courseNumber: course.code,
        //           subject: course.subject,
        //           sequenceNumber: 'string',
        //           courseTitle: 'string',
        //           meetingTime: {},
        //         };
        //       })
        //     : [];

        const response = await fetch(url, {
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

        return { success: true, message: JSON.stringify(response.json()) };
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
