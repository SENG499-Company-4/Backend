import { enumType } from 'nexus';

export const Term = enumType({
  name: 'Term',
  description: 'UVic Terms',
  members: ['FALL', 'SPRING', 'SUMMER'],
});
