import { Kind } from 'graphql';
import { scalarType } from 'nexus';

export const DateType = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  parseValue(value) {
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return date.getTime();
    }
  },
  serialize(value) {
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      return new Date(value);
    }
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
  },
});
