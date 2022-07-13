/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable camelcase */
import { arg, extendType, inputObjectType, intArg, nonNull, objectType } from 'nexus';
import { Course, PrismaClient } from '@prisma/client';
import { Algo1Course, Algorithm1Input, Algorithm1Out, Algorithm2, Professor } from '../utils/types';
import { usePost } from '../utils/api';
import { prisma } from '../context';
import { Company } from './Company';
import { CourseInput } from './Course';
import { CourseSection } from './Course/Section';
import { DateType as ScalarDate } from './DateType';
import { Response } from './Response';
import { Term } from './Term';

export const GenerateScheduleInput = inputObjectType({
  name: 'GenerateScheduleInput',
  definition(t) {
    t.nonNull.int('year');
    t.nonNull.field('term', { type: Term });
    t.list.field('courses', { type: nonNull(CourseInput) });
    t.nonNull.field('algorithm1', { type: Company });
    t.nonNull.field('algorithm2', { type: Company });
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
      resolve: async (_, { input: { algorithm1, algorithm2, courses, term, year } }) => {
        if (!courses || courses.length === 0) {
          return { success: false, message: 'Courses must be passed in to generate a schedule.' };
        }

        // Determine which company to use for each algorithm
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
        const newCourses: Course[] = await Promise.all(
          courses.map(async ({ subject, code, section }: { subject: string; code: string; section: number }) => {
            const newCourse = await (prisma as PrismaClient).course.upsert({
              create: {
                subject,
                code,
                term,
                year,
                peng: 'NOTREQUIRED',
                capacity: 0,
                schedule: {
                  connect: {
                    id: schedule.id,
                  },
                },
                sections: {},
              },
              update: {
                subject,
                code,
                term,
                year,
                capacity: 0,
                schedule: {
                  connect: {
                    id: schedule.id,
                  },
                },
              },
              where: {
                subject_code_year_term: {
                  code,
                  term,
                  year,
                  subject,
                },
              },
            });

            // Initialize the new section codes
            const sections: { code: string }[] = [];
            for (let i = 0; i < section; i++) {
              sections.push({
                code: i < 9 ? `A0${i + 1}` : `A${i + 1}`,
              });
            }
            // Remove any existing meeting times
            await (prisma as PrismaClient).meetingTime.deleteMany({
              where: {
                sectionCourseId: newCourse.id,
              },
            });
            // Remove any existing sections
            await (prisma as PrismaClient).section.deleteMany({
              where: {
                courseId: newCourse.id,
              },
            });
            // Connect the new sections to the course
            return await (prisma as PrismaClient).course.update({
              where: {
                id: newCourse.id,
              },
              data: {
                sections: {
                  create: sections,
                },
              },
            });
          })
        );

        // Construct the expected input for algorithm 2
        const algorithm2Input: Algorithm2[] = newCourses.map(({ code, subject, capacity }) => {
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

          // Update capacities in the database from algorithm 2's response
          const dbCourses = await Promise.all(
            courseCapacities.map(async ({ code, subject, semester, capacity }) => {
              return await (prisma as PrismaClient).course.update({
                data: {
                  capacity,
                },
                where: {
                  subject_code_year_term: {
                    subject,
                    code,
                    year,
                    term: semester,
                  },
                },
                include: {
                  sections: true,
                },
              });
            })
          );

          // Create course input for algorithm 1
          const algo1Courses: Algo1Course[] = [];
          dbCourses.forEach(({ code, subject, capacity, sections }) => {
            sections.forEach(({ code: sequenceNumber }) => {
              algo1Courses.push({
                courseNumber: code,
                subject,
                sequenceNumber,
                streamSequence: '2A',
                courseTitle: 'Calculus',
                courseCapacity: capacity,
                numSections: sections.length,
              });
            });
          });

          // Assign input to correct term array
          const fallCourses: Algo1Course[] = term === 'FALL' ? algo1Courses : [];
          const summerCourses: Algo1Course[] = term === 'SUMMER' ? algo1Courses : [];
          const springCourses: Algo1Course[] = term === 'SPRING' ? algo1Courses : [];

          // Prepare professor preferences for algorithm 1
          const users = await (prisma as PrismaClient).user.findMany();
          const professors: Professor[] = await Promise.all(
            users
              .map(async ({ id, username }) => {
                const preferences = await (prisma as PrismaClient).preference.findMany({
                  where: {
                    courseID: {
                      in: dbCourses.map(({ id }) => id),
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
              .filter(async (professor) => await (await professor).preferences)
          );

          // Merge courses and preferences for algorithm 1 input
          const algo1Input: Algorithm1Input = {
            hardScheduled: {
              fallCourses: [],
              summerCourses: [],
              springCourses: [],
            },
            coursesToSchedule: {
              fallCourses,
              summerCourses,
              springCourses,
            },
            professors,
          };

          // Call algorithm 1
          const generatedSchedule = await usePost<Algorithm1Input, Algorithm1Out>(algo1url, algo1Input);

          if (!generatedSchedule.fallCourses && !generatedSchedule.springCourses && !generatedSchedule.summerCourses) {
            return { success: false, message: 'No schedule was generated' };
          }

          let thisTermsCourses = generatedSchedule.fallCourses;
          if (term === 'SPRING') thisTermsCourses = generatedSchedule.springCourses;
          if (term === 'SUMMER') thisTermsCourses = generatedSchedule.summerCourses;

          // Create new meeting times in the database based on response from algorithm 1
          thisTermsCourses.forEach(async ({ sequenceNumber: code, courseNumber, subject, assignment, prof }) => {
            // Get the database object for the relevant course
            const course = await (prisma as PrismaClient).course.findFirst({
              where: {
                subject,
                code: courseNumber,
                year,
                term,
                scheduleID: schedule.id,
              },
            });

            if (!course) return;

            // Delete any existing meeting times
            (prisma as PrismaClient).meetingTime.deleteMany({
              where: {
                sectionCourseId: course.id,
              },
            });

            if (!assignment) return;
            const {
              sunday,
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              beginTime,
              endTime,
              startDate,
              endDate,
            } = assignment;

            const meetingTimes = [];
            if (sunday) {
              meetingTimes.push({
                day: 'SUNDAY',
                startTime: beginTime ? new Date(beginTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
              });
            }
            if (monday) {
              meetingTimes.push({
                day: 'MONDAY',
                startTime: beginTime ? new Date(beginTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
              });
            }
            if (tuesday) {
              meetingTimes.push({
                day: 'TUESDAY',
                startTime: beginTime ? new Date(beginTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
              });
            }
            if (wednesday) {
              meetingTimes.push({
                day: 'WEDNESDAY',
                startTime: beginTime ? new Date(beginTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
              });
            }
            if (thursday) {
              meetingTimes.push({
                day: 'THURSDAY',
                startTime: beginTime ? new Date(beginTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
              });
            }
            if (friday) {
              meetingTimes.push({
                day: 'FRIDAY',
                startTime: beginTime ? new Date(beginTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
              });
            }
            if (saturday) {
              meetingTimes.push({
                day: 'SATURDAY',
                startTime: beginTime ? new Date(beginTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
              });
            }

            // Update the section with the new meeting times and start/end date
            await (prisma as PrismaClient).section.update({
              where: {
                code_courseId: {
                  code,
                  courseId: course.id,
                },
              },
              data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                professor: {
                  connect: {
                    username: prof?.displayName,
                  },
                },
                meetingTimes: {
                  create: meetingTimes,
                },
              },
            });
          });
        } catch (e) {
          return { success: false, message: (e as Error).message };
        }

        return { success: true };
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
      resolve: async (_, { year }, { prisma }) => {
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

        // Fetch courses from the latest schedule
        const courses = await (prisma as PrismaClient).course.findMany({
          where: {
            scheduleID: schedule.id,
          },
        });

        // Fetch sections for the course
        const sections = await (prisma as PrismaClient).section.findMany({
          where: {
            courseId: {
              in: courses.map(({ id }) => id),
            },
          },
          include: {
            professor: true,
          },
        });

        const courseSections = await Promise.all(
          sections.map(async (section) => ({
            ...section,
            course: courses.find((course) => course.id === section.courseId),
            professor: section.professor,
            meetingTimes: await (prisma as PrismaClient).meetingTime.findMany({
              where: {
                sectionCourseId: section.courseId,
              },
            }),
          }))
        );

        // Return schedule object
        return {
          id: String(schedule.id),
          year: schedule.year ?? 0,
          createdAt: schedule.createdAt,
          courses: courseSections.map(({ course, professor, meetingTimes, startDate, endDate }) => ({
            CourseID: {
              subject: course!.subject,
              code: course!.code,
              term: course!.term,
              year: year ?? 0,
            },
            hoursPerWeek: course!.weeklyHours ?? 0,
            capacity: course!.capacity ?? 0,
            professors: professor,
            startDate: startDate ?? new Date(),
            endDate: endDate ?? new Date(),
            meetingTimes: meetingTimes.map(({ id, sectionCourseId, day, startTime, endTime }) => ({
              id: id,
              courseID: sectionCourseId,
              day: day ?? 'SUNDAY',
              startTime: startTime,
              endTime: endTime,
              scheduleID: schedule.id,
            })),
          })),
        };
      },
    });
  },
});
