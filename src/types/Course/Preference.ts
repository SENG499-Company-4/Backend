import { extendType, objectType } from 'nexus';
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
    t.nonNull.list.nonNull.field('courses', { type: CourseID });
  },
});

export const PreferenceQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('survey', {
      type: TeachingPreferenceSurvey,
      description: 'Get Teaching Preference Survey',
    });
  },
});
