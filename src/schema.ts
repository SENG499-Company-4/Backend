import { join } from 'path';
import { makeSchema } from 'nexus';
import * as types from './types';

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, '..', 'node_modules', '@types', 'nexus-typegen', 'index.d.ts'),
    schema: join(__dirname, '..', 'schema.graphql'),
  },
  contextType: {
    module: join(process.cwd(), './src/context.ts'),
    export: 'Context',
  },
});
