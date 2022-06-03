import { enumType, objectType } from 'nexus';
import { Date } from '../Date';

export const Day = enumType({
  name: 'Day',
  description: 'Days of the Week',
  members: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
});

export const MeetingTime = objectType({
  name: 'MeetingTime',
  description: 'Weekday and time of a course section offering',
  definition(t) {
    t.nonNull.field('day', {
      type: Day,
      description: 'Weekday - see DayEnum',
    });
    t.nonNull.field('startTime', { description: 'Start time', type: Date });
    t.nonNull.field('endTime', { description: 'End time', type: Date });
  },
});
