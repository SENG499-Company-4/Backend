import { enumType } from 'nexus';

export const Company = enumType({
  name: 'Company',
  description: 'Company 3 and 4',
  members: ['COMPANY3', 'COMPANY4'],
});
