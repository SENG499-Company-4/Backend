/* eslint-disable camelcase */
import { arg, extendType, inputObjectType, intArg, nonNull, objectType } from 'nexus';
import { Course, MeetingTime, PrismaClient, Section, User } from '@prisma/client';
import { Algo1Course, Algorithm1Input, Algorithm1Out, Algorithm2, Professor } from '../utils/types';
import { usePost } from '../utils/api';
import { prisma } from '../context';
import { createAlgo1Input, createNewCourses, updateCourses } from '../utils/schedule';
import { Company } from './Company';
import { CourseInput, MeetingTimeInput } from './Course';
import { CourseSection } from './Course/Section';
import { DateType as ScalarDate } from './DateType';
import { Response } from './Response';
import { Term } from './Term';

export const GenerateScheduleInput = inputObjectType({
  name: 'GenerateScheduleInput',
  definition(t) {
    t.nonNull.int('year');
    t.list.field('fallCourses', { type: nonNull(CourseInput) });
    t.list.field('springCourses', { type: nonNull(CourseInput) });
    t.list.field('summerCourses', { type: nonNull(CourseInput) });
    t.nonNull.field('algorithm1', { type: Company });
    t.nonNull.field('algorithm2', { type: Company });
  },
});

export const UpdateScheduleResponse = objectType({
  name: 'UpdateScheduleResponse',
  definition(t) {
    t.nonNull.boolean('success', { description: 'Whether the update was successful' });
    t.string('message', { description: 'General messaging for the client to consume.' });
    t.list.nonNull.string('errors', {
      description:
        'Errors associated to updating the schedule. Only populated if success is false. This could include validation issues.',
    });
  },
});

export const UpdateScheduleInput = inputObjectType({
  name: 'UpdateScheduleInput',
  definition(t) {
    t.id('id', {
      description: 'ID of the schedule to update. If not given, the current schedule will be updated.',
    });
    t.nonNull.list.field('courses', { type: nonNull(CourseSectionInput), description: 'The updated courses' });
    t.nonNull.boolean('skipValidation', {
      description: 'Whether to perform validation on the backend through algorithm 1.',
    });
    t.nonNull.field('validation', {
      type: Company,
      description:
        'Which algorithm to use. If COMPANY4 is selected then validation will not be performed regardless of skipValidation.',
    });
  },
});

export const CourseSectionInput = inputObjectType({
  name: 'CourseSectionInput',
  definition(t) {
    t.nonNull.field('id', { type: nonNull(CourseUpdateInput), description: 'The course identifier' });
    t.nonNull.float('hoursPerWeek', { description: 'How many hours per week a course takes' });
    t.nonNull.int('capacity', { description: 'Maximum capacity of the section' });
    t.string('sectionNumber', { description: 'Section number for courses, eg: A01, A02' });
    t.nonNull.list.nonNull.string('professors', {
      description: "Professor's info, if any professors are assigned. Usernames",
    });
    t.nonNull.date('startDate', { description: 'The start date of the course' });
    t.nonNull.date('endDate', { description: 'The end date of the course' });
    t.nonNull.list.field('meetingTimes', {
      type: nonNull(MeetingTimeInput),
      description: 'Days of the week the class is offered in - see Day',
    });
  },
});

export const CourseUpdateInput = inputObjectType({
  name: 'CourseUpdateInput',
  definition(t) {
    t.nonNull.string('subject', { description: 'Course subject, e.g. SENG, CSC' });
    t.nonNull.string('code', { description: 'Course code, e.g. 499, 310' });
    t.nonNull.string('title', { description: 'Course Title e.g. Introduction to Artificial Intelligence' });
    t.nonNull.field('term', { type: Term, description: 'Term course is offered in' });
  },
});

export const Schedule = objectType({
  name: 'Schedule',
  description: 'Generated schedule for a year',
  definition(t) {
    t.nonNull.id('id', { description: 'ID of the schedule' });
    t.nonNull.int('year', { description: 'Year for the schedule' });
    t.nonNull.field('createdAt', { description: 'When the schedule was generated', type: ScalarDate });
    t.list.nonNull.field('courses', {
      type: CourseSection,
      description: 'Scheduled courses',
      args: {
        term: arg({ type: nonNull(Term) }),
      },
      resolve: async ({ year, id }, { term }) => {
        const courses = await (prisma as PrismaClient).course.findMany({
          where: {
            scheduleID: Number(id),
            term,
          },
          include: {
            sections: {
              include: {
                meetingTimes: true,
                professor: true,
              },
            },
          },
        });

        const courseSections: (Section & { course: Course; professor: User[]; meetingTimes: MeetingTime[] })[] = [];
        courses.forEach((course) => {
          course.sections.forEach((section) => {
            const courseSection = {
              ...section,
              course,
              professor: section.professor,
              meetingTimes: section.meetingTimes,
            };

            courseSections.push(courseSection);
          });
        });
        return courseSections.map(({ course, professor, meetingTimes, startDate, endDate, code }) => ({
          CourseID: {
            subject: course.subject,
            code: course.code,
            term: course.term,
            year: year ?? 0,
          },
          hoursPerWeek: course.weeklyHours ?? 0,
          capacity: course.capacity ?? 0,
          professors: professor,
          startDate: startDate,
          endDate: endDate,
          sectionNumber: code,
          meetingTimes: meetingTimes.map(({ id: meetingTimeId, sectionCourseId, day, startTime, endTime }) => ({
            id: meetingTimeId,
            courseID: sectionCourseId,
            day: day ?? 'SUNDAY',
            startTime: startTime,
            endTime: endTime,
            scheduleID: id,
          })),
        }));
      },
    });
  },
});

export const ScheduleMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('generateSchedule', {
      type: Response,
      description: 'Generate schedule',
      args: {
        input: arg({ type: nonNull(GenerateScheduleInput) }),
      },
      resolve: async (_, { input: { algorithm1, algorithm2, fallCourses, summerCourses, springCourses, year } }) => {
        if (!fallCourses && !summerCourses && !springCourses) {
          return { success: false, message: 'Courses must be passed in to generate a schedule.' };
        }

        const algo1url =
          algorithm1 === 'COMPANY4'
            ? 'https://seng499company4algorithm1.herokuapp.com/schedule'
            : 'https://schedulater-algorithm1.herokuapp.com/schedule';

        const algo2Url =
          algorithm2 === 'COMPANY3'
            ? 'https://algorithm-2.herokuapp.com/predict_class_size'
            : 'https://seng499company4algorithm2.herokuapp.com/predict_class_size';

        // Create the new schedule in the database
        const schedule = await (prisma as PrismaClient).schedule.create({
          data: {
            createdAt: new Date(),
            year,
          },
        });

        // Create or update the provided courses in the DB and connect them to the new schedule
        // Theoretically it should already exist as professors should submit preferences for it
        // Submitting preferences will instantiate it in the database
        const newFallCourses = await createNewCourses(fallCourses ?? [], 'FALL', year, schedule.id);
        const newSpringCourses = await createNewCourses(springCourses ?? [], 'SPRING', year, schedule.id);
        const newSummerCourses = await createNewCourses(summerCourses ?? [], 'SUMMER', year, schedule.id);
        const newCourses = [...newFallCourses, ...newSpringCourses, ...newSummerCourses];

        // Construct the expected input for algorithm 2
        const algorithm2Input: Algorithm2[] = newCourses.map(({ code, subject, capacity, term }) => {
          return {
            code,
            subject,
            seng_ratio: 0.75,
            semester: term,
            capacity: capacity ?? 0,
          };
        });

        try {
          // Call algorithm 2
          const courseCapacities = await usePost<Algorithm2[], Algorithm2[]>(algo2Url, algorithm2Input);

          // Update capacities for the new courses from algorithm 2's response
          courseCapacities.forEach(({ code, subject, semester, capacity }) => {
            const courseIndex = newCourses.findIndex(
              (course) => code === course.code && subject === course.subject && semester === course.term
            );
            newCourses[courseIndex].capacity = capacity;
          });

          // Assign input to correct term array
          const algo1FallCourses: Algo1Course[] = createAlgo1Input(newFallCourses);
          const algo1SummerCourses: Algo1Course[] = createAlgo1Input(newSummerCourses);
          const algo1SpringCourses: Algo1Course[] = createAlgo1Input(newSpringCourses);

          // Prepare professor preferences for algorithm 1
          const users = await (prisma as PrismaClient).user.findMany();
          const professors: Professor[] = await Promise.all(
            users
              .map(async ({ id, username }) => {
                const preferences = await (prisma as PrismaClient).preference.findMany({
                  where: {
                    courseID: {
                      in: newCourses.map(({ id: courseId }) => courseId),
                    },
                    userID: id,
                  },
                });

                const profSettings = await (prisma as PrismaClient).professorSettings.findUnique({
                  where: {
                    year_userID: {
                      year,
                      userID: id,
                    },
                  },
                });

                return {
                  displayName: username ?? 'TBD',
                  preferences: preferences.map(({ rank, courseCode, courseSubject }) => ({
                    preferenceNum: rank ?? 0,
                    courseNum: `${courseSubject}${courseCode}`,
                  })),
                  fallTermCourses: profSettings?.maxCoursesFall ?? 0,
                  springTermCourses: profSettings?.maxCoursesSpring ?? 0,
                  summerTermCourses: profSettings?.maxCoursesSummer ?? 0,
                };
              })
              .filter(async (professor) => (await professor).preferences)
          );

          // Merge courses and preferences for algorithm 1 input
          const algo1Input: Algorithm1Input = {
            hardScheduled: {
              fallCourses: [],
              summerCourses: [],
              springCourses: [],
            },
            coursesToSchedule: {
              fallCourses: algo1FallCourses,
              summerCourses: algo1SummerCourses,
              springCourses: algo1SpringCourses,
            },
            professors,
          };

          // Call algorithm 1
          const generatedSchedule = await usePost<Algorithm1Input, Algorithm1Out>(algo1url, algo1Input);

          if (!generatedSchedule.fallCourses && !generatedSchedule.springCourses && !generatedSchedule.summerCourses) {
            return { success: false, message: 'No schedule was generated' };
          }

          // Update courses in the database based on response from algorithm 1
          updateCourses(generatedSchedule.fallCourses, newFallCourses, 'FALL');
          updateCourses(generatedSchedule.springCourses, newSpringCourses, 'SPRING');
          updateCourses(generatedSchedule.summerCourses, newSummerCourses, 'SUMMER');
        } catch (e) {
          return { success: false, message: (e as Error).message };
        }

        return { success: true };
      },
    });
    t.nonNull.field('updateSchedule', {
      type: UpdateScheduleResponse,
      description: 'Update schedule',
      args: {
        input: arg({ type: nonNull(UpdateScheduleInput) }),
      },
      resolve: async (_, { input: { id, courses, skipValidation, validation } }) => {
        if (validation === 'COMPANY3' && !skipValidation) {
          // TODO: Validate the schedule
        }

        let schedule = await (prisma as PrismaClient).schedule.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!schedule) {
          schedule = await (prisma as PrismaClient).schedule.findFirst({
            orderBy: { createdAt: 'desc' },
            where: {
              year: (await (prisma as PrismaClient).schedule.findMany({ orderBy: { createdAt: 'desc' } }))[0].year,
            },
          });
        }

        const coursesToUpdate = await (prisma as PrismaClient).course.findMany({
          where: {
            scheduleID: schedule?.id,
          },
        });

        courses?.forEach(
          async ({
            id: { code, subject, term },
            hoursPerWeek,
            capacity,
            sectionNumber,
            professors,
            startDate,
            endDate,
            meetingTimes,
          }) => {
            const course = coursesToUpdate.find(
              (course) => course.code === code && course.subject === subject && course.term === term
            );

            const courseSection = await (prisma as PrismaClient).section.findUnique({
              where: {
                code_courseId: {
                  code: sectionNumber ?? '',
                  courseId: course?.id ?? 0,
                },
              },
            });

            await (prisma as PrismaClient).course.update({
              where: {
                id: course?.id,
              },
              data: {
                weeklyHours: hoursPerWeek,
                capacity,
              },
            });

            await (prisma as PrismaClient).meetingTime.deleteMany({
              where: {
                sectionCode: courseSection?.code,
                sectionCourseId: courseSection?.courseId,
              },
            });

            await (prisma as PrismaClient).section.update({
              where: {
                id: courseSection?.id,
              },
              data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                meetingTimes: {
                  createMany: {
                    data: meetingTimes.map(({ day, startTime, endTime }) => ({
                      day,
                      startTime: new Date(startTime),
                      endTime: new Date(endTime),
                    })),
                  },
                },
                professor: {
                  connectOrCreate: professors.map((profUsername) => ({
                    where: {
                      username: profUsername,
                    },
                    create: {
                      username: profUsername,
                      password: profUsername,
                    },
                  })),
                },
              },
            });
          }
        );

        return {
          success: true,
          message: `Modified schedule with id ${id} for ${schedule?.year} created on ${schedule?.createdAt}`,
        };
      },
    });
  },
});

export const ScheduleQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('schedule', {
      type: Schedule,
      description:
        'Schedule for a given term. If year is given, returns the most recent schedule generated for that year.',
      args: {
        year: intArg(),
      },
      resolve: async (__, { year }) => {
        const schedule = await (prisma as PrismaClient).schedule.findFirst({
          orderBy: { createdAt: 'desc' },
          where: {
            year:
              year || (await (prisma as PrismaClient).schedule.findMany({ orderBy: { createdAt: 'desc' } }))[0].year,
          },
        });

        // Return error if latest schedule does not exist
        if (!schedule) {
          return null;
        }

        // Return schedule object
        return {
          id: String(schedule.id),
          year: schedule.year ?? 0,
          createdAt: schedule.createdAt,
        };
      },
    });
  },
});
