import { PrismaClient } from '@prisma/client';
import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { getUserId } from '../../utils/auth';
import { Response } from '../Response';
import { Term } from '../Term';
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
      type: Term,
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
    t.nonNull.list.nonNull.field('CoursePreferenceInput', {
      type: CoursePreferenceInput,
    });
    t.nonNull.field('nonTeachingTerm', {
      type: Term,
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

        const courses = prefs.map(({ courseID, rank }) => ({
          id: courseID,
          preference: rank,
        }));

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
    t.nonNull.field('coursePreferences', {
      type: CoursePreference,
      description: 'Get all courses preferences',
      resolve: async (_, __, { prisma }) => {
        const prefs = await (prisma as PrismaClient).preference.findMany();

        const courses = prefs.map(({ courseID, rank }) => ({
          id: courseID,
          preference: rank,
        }));

        return {
          courses,
        };
      },
    });
  },
});

export const ScheduleMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createTeachingPreference', {
      type: Response,
      description: 'Teaching preferences',
      args: {
        input: arg({ type: nonNull(CreateTeachingPreferenceInput) }),
      },
      resolve: async () => {
        // resolve: async (_, { input: { peng, userId, courses, nonTeachingTerm, hasRelief, reliefReason, hasTopic, topicDescription } }, { prisma }) => {
        return { success: false, message: 'Not Implemented' };
      },
    });
  },
});
