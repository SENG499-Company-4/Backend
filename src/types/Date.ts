import { scalarType } from 'nexus';

export const Date = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  serialize() {
    /* Todo */
  },
  parseValue() {
    /* Todo */
  },
  parseLiteral() {
    /* Todo */
  },
});
