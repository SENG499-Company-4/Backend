import { join } from 'path';
import { fieldAuthorizePlugin, makeSchema } from 'nexus';
import * as types from './types';

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, '..', 'nexus-typegen.ts'),
    schema: join(__dirname, '..', 'schema.graphql'),
  },
  contextType: {
    module: join(process.cwd(), './src/context.ts'),
    export: 'Context',
  },
  plugins: [fieldAuthorizePlugin()],
});
