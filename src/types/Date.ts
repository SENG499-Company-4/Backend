// import { GraphQLScalarType, Kind } from 'graphql';
// import { DateTimeResolver } from 'graphql-scalars';
import { Kind } from 'graphql';
import { scalarType } from 'nexus';

// This only works if the object is named "Date". Try renaming it here and in Schedule.ts and it won't work.
// Don't ask me why, it's ridiculous and I've spent ages trying to figure this out.
// We can't implement any functions here because you guessed it, they rely on js Date objects that have conflicting names.
export const Date = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  parseValue() {
    return;
    // if (typeof value === 'string' || typeof value === 'number') {
    //   return new Date(value);
    // }
  },
  serialize() {
    return '1999-01-01T00:00:00.000Z';
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return;
    }
    return null;
  },
  // serialize(value: Date | unknown) {
  // RFC3339 example time
  // return '1999-01-01T00:00:00.000Z';
  // if (value instanceof Date) return value.getTime();
  // },
});

// export const DateTime = scalarType({
//   name: 'Date',
//   asNexusMethod: 'date',
//   description: 'Date custom scalar type',
//   parseValue(value: string | number | Date | unknown) {
//     if (typeof value === 'string' || typeof value === 'number') {
//       return new Date(value);
//     }
//   },
//   serialize(value: Date | unknown) {
//     if (value instanceof Date) return value.getTime();
//   },
//   parseLiteral(ast) {
//     if (ast.kind === Kind.INT) {
//       return new Date(ast.value);
//     }
//     return null;
//   },
// });
