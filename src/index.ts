import { ApolloServer } from 'apollo-server';
import { context } from './context';
import { schema } from './schema';

export const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    return {
      ...context,
      token: req.headers.authorization,
    };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
