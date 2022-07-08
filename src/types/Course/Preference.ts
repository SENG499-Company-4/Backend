import { PrismaClient } from '@prisma/client';
import { extendType, objectType } from 'nexus';
import { getUserId } from '../../utils/auth';
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
