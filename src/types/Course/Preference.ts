import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { PrismaClient, Term } from '@prisma/client';
import { getUserId } from '../../utils/auth';
import { Response } from '../Response';
import { Term as TermType } from '../Term';
import { CourseID } from './ID';

export const CoursePreference = objectType({
  name: 'CoursePreference',
  definition(t) {
    t.nonNull.field('id', {
      type: CourseID,
    });
    t.nonNull.int('preference');
  },
});

export const TeachingPreferenceSurvey = objectType({
  name: 'TeachingPreferenceSurvey',
  definition(t) {
    t.nonNull.list.nonNull.field('courses', { type: CoursePreference });
  },
});

export const CoursePreferenceInput = inputObjectType({
  name: 'CoursePreferenceInput',
  definition(t) {
    t.nonNull.string('subject', { description: 'Course subject, e.g. SENG, CSC' });
    t.nonNull.string('code', { description: 'Course code, e.g. 499, 310' });
    t.nonNull.field('term', {
      type: TermType,
      description: 'Term course is offered in',
    });
    t.nonNull.int('preference');
  },
});

export const CreateTeachingPreferenceInput = inputObjectType({
  name: 'CreateTeachingPreferenceInput',
  definition(t) {
    t.nonNull.boolean('peng');
    t.nonNull.id('userId');
    t.nonNull.int('year');
    t.nonNull.list.nonNull.field('courses', {
      type: CoursePreferenceInput,
    });
    t.nonNull.field('nonTeachingTerm', {
      type: TermType,
    });
    t.nonNull.boolean('hasRelief');
    t.string('reliefReason');
    t.nonNull.boolean('hasTopic');
    t.string('topicDescription');
    t.nonNull.int('maxFallCapacity');
    t.nonNull.int('maxSpringCapacity');
    t.nonNull.int('maxSummerCapacity');
  },
});

export const PreferenceQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('survey', {
      type: TeachingPreferenceSurvey,
      description: 'Get Teaching Preference Survey for the current user',
      resolve: async (_, __, { prisma, token }) => {
        const prefs = await (prisma as PrismaClient).preference.findMany({
          where: {
            user: {
              id: getUserId(token),
            },
          },
        });

        const courses = await Promise.all(
          prefs.map(async ({ courseID, rank }) => {
            const courseData = await (prisma as PrismaClient).course.findUnique({
              where: {
                id: courseID,
              },
            });

            if (!courseData) {
              return {
                id: {
                  subject: '',
                  code: '',
                  term: '' as Term,
                  year: 0,
                },
                preference: 0,
              };
            }
            return {
              id: {
                subject: courseData.subject,
                code: courseData.code,
                term: courseData.term,
                year: courseData.year,
              },
              preference: rank ?? 0,
            };
          })
        );
        return {
          courses,
        };
      },
    });
  },
});

export const AllPreferencesQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.nonNull.field('coursePreferences', {
      type: CoursePreference,
      description: 'Get all courses preferences',
      resolve: async (_, __, { prisma }) => {
        const prefs = await (prisma as PrismaClient).preference.findMany();
        const courses = await Promise.all(
          prefs.map(async ({ courseID, rank }) => {
            const courseData = await (prisma as PrismaClient).course.findUnique({
              where: {
                id: courseID,
              },
            });
            if (!courseData) {
              return {
                id: {
                  subject: '',
                  code: '',
                  term: 'FALL' as Term,
                  year: 0,
                },
                preference: 0,
              };
            }
            return {
              id: {
                subject: courseData.subject,
                code: courseData.code,
                term: courseData.term,
                year: courseData.year,
              },
              preference: rank ?? 0,
            };
          })
        );
        return courses;
      },
    });
  },
});

export const PreferenceMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createTeachingPreference', {
      type: Response,
      description: 'Teaching preferences',
      args: {
        input: arg({ type: nonNull(CreateTeachingPreferenceInput) }),
      },
      resolve: async (
        _,
        {
          input: {
            peng,
            userId,
            year,
            courses,
            hasRelief,
            reliefReason,
            hasTopic,
            topicDescription,
            maxFallCapacity,
            maxSpringCapacity,
            maxSummerCapacity,
          },
        },
        { prisma }
      ) => {
        const courseObjs = await Promise.all(
          courses.map(
            async ({
              subject,
              code,
              term,
              preference,
            }: {
              subject: string;
              code: string;
              term: Term;
              preference: number;
            }) => {
              const courseData = await (prisma as PrismaClient).course.findFirst({
                where: {
                  subject: subject,
                  code: code,
                  term: term,
                  year: year,
                },
              });

              const courseID = courseData ? courseData.id : -1; //if courseData is null set id to -1

              return {
                courseID: courseID,
                rank: preference ?? 0,
              };
            }
          )
        );

        for (const courseObj of courseObjs) {
          await (prisma as PrismaClient).preference.upsert({
            where: {
              // eslint-disable-next-line camelcase
              userID_courseID: {
                userID: Number(userId),
                courseID: courseObj.courseID,
              },
            },
            update: {
              rank: courseObj.rank,
            },
            create: {
              userID: Number(userId),
              courseID: courseObj.courseID,
              rank: courseObj.rank,
            },
          });
        }

        await (prisma as PrismaClient).user.update({
          where: {
            id: Number(userId),
          },
          data: {
            peng: peng,
          },
        });

        await (prisma as PrismaClient).professorSettings.upsert({
          where: {
            // eslint-disable-next-line camelcase
            userID_year: {
              userID: Number(userId),
              year: Number(year),
            },
          },
          update: {
            maxCoursesFall: maxFallCapacity,
            maxCoursesSpring: maxSpringCapacity,
            maxCoursesSummer: maxSummerCapacity,
            hasRelief: hasRelief,
            reliefReason: reliefReason ?? '',
            hasTopic: hasTopic,
            topicDescription: topicDescription ?? '',
          },
          create: {
            userID: Number(userId),
            year: year,
            maxCoursesFall: maxFallCapacity,
            maxCoursesSpring: maxSpringCapacity,
            maxCoursesSummer: maxSummerCapacity,
            hasRelief: hasRelief,
            reliefReason: reliefReason ?? '',
            hasTopic: hasTopic,
            topicDescription: topicDescription ?? '',
          },
        });
        return { success: true, message: 'Preferences Added' };
      },
    });
  },
});
