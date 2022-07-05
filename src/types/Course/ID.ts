import { inputObjectType, objectType } from 'nexus';
import { Term } from '../Term';

export const CourseID = objectType({
  name: 'CourseID',
  definition(t) {
    t.nonNull.string('subject', { description: 'Course subject, e.g. SENG, CSC' });
    t.nonNull.string('code', { description: 'Course code, e.g. 499, 310' });
    t.nonNull.field('term', {
      type: Term,
      description: 'Term course is offered in',
    });
    t.nonNull.int('year', { description: 'Year course is offered in' });
  },
});

export const CourseIDInput = inputObjectType({
  name: 'CourseIDInput',
  definition(t) {
    t.nonNull.string('subject', { description: 'Course subject, e.g. SENG, CSC' });
    t.nonNull.string('code', { description: 'Course code, e.g. 499, 310' });
    t.nonNull.field('term', {
      type: Term,
      description: 'Term course is offered in',
    });
    t.nonNull.int('year', { description: 'Year course is offered in' });
  },
});
