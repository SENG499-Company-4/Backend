import { PrismaClient } from '@prisma/client';
import { arg, extendType, objectType } from 'nexus';
import { CourseID } from './ID';
// import { User } from '../User';

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
    t.nonNull.list.nonNull.field('courses', { type: CourseID });
  },
});

export const PreferenceQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('survey', {
      type: TeachingPreferenceSurvey,
      description: 'Get Teaching Preference Survey for a given username and course offering',
      args: {
        username: arg({ type: 'String' }),
        courseid: arg({ type: 'Int' }),
      },
      resolve: async (_, args, ctx) => {
        const { username, courseid } = args;
        const { prisma } = ctx;
        if(!username || !courseid) {
          return null;
        }
        const pref = await (prisma as PrismaClient).preference.findFirst({
          where: {
            user: {
              username,
            },
            courseID: courseid,
          },
        });

        return pref;
      }
    },
    );
  }
});
