import { objectType } from 'nexus';

export const Error = objectType({
  name: 'Error',
  definition(t) {
    t.nonNull.string('message');
    t.list.nonNull.field('errors', { type: Error });
  },
});
