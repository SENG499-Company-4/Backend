import { PrismaClient } from '@prisma/client';
import { arg, extendType, objectType } from 'nexus';
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
      description: 'Get Teaching Preference Survey for a given User ID',
      args: {
        userid: arg({ type: 'Int' }),
      },
      resolve: async (_, { userid }, { prisma }) => {
        if(!userid) {
          return null;
        }
        let prefs: any = [];
        const pref = await (prisma as PrismaClient).preference.findMany({
          where: {
            user: {
              id: userid,
            }
          },
        });
        
        for (const p of pref) {
          prefs.push({
            id: p.courseID,
            preference: p.rank,
          });
        }
        return {
          courses: prefs,
        };
          
      }
    },
    );
  }
});
