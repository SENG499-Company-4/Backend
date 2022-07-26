/* eslint-disable camelcase */
import { Course, CourseInfo, PrismaClient, Term } from '@prisma/client';
import { prisma } from '../context';
import { Algo1Course } from './types';

export const createNewCourses = async (
  courses: { code: string; section: number; subject: string }[],
  term: Term,
  year: number,
  scheduleId: number
) => {
  const newCourses: (Course & { sectionCount: number; courseInfo: CourseInfo | null })[] = await Promise.all(
    courses.map(async ({ subject, code, section }: { subject: string; code: string; section: number }) => {
      const courseInfo = await (prisma as PrismaClient).courseInfo.findUnique({
        where: {
          subject_code: {
            subject,
            code,
          },
        },
      });

      const newCourse = await (prisma as PrismaClient).course.upsert({
        create: {
          subject,
          code,
          term,
          year,
          capacity: 0,
          schedule: {
            connect: {
              id: scheduleId,
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
              id: scheduleId,
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
        include: {
          sections: {
            include: {
              meetingTimes: true,
            },
          },
        },
      });

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

      return { ...newCourse, sectionCount: section, courseInfo };
    })
  );

  return newCourses;
};

export const createAlgo1Input = (courses: (Course & { sectionCount: number; courseInfo: CourseInfo | null })[]) => {
  const algo1Courses: Algo1Course[] = [];
  courses.forEach(({ code, subject, capacity, sectionCount: numSections, courseInfo }) => {
    algo1Courses.push({
      courseNumber: code,
      subject,
      // sequenceMatter does not matter because algo 1 uses numSections instead
      sequenceNumber: 'A01',
      streamSequence: courseInfo?.sequenceNumber ?? '',
      courseTitle: courseInfo?.title ?? '',
      courseCapacity: capacity,
      numSections,
    });
  });

  return algo1Courses;
};

const getCourseRangeDate = (type: 'start' | 'end', term: Term, year: number): Date => {
  let month, day;
  if (term === 'FALL') {
    if (type === 'start') {
      month = 9;
      if (year === 2021) day = 6;
      if (year === 2022) day = 5;
      if (year === 2023) day = 4;
      if (year === 2024) day = 2;
    } else if (type === 'end') {
      month = 12;
      if (year === 2021) day = 3;
      if (year === 2022) day = 2;
      if (year === 2023) day = 1;
      if (year === 2024) day = 6;
    }
  } else if (term === 'SPRING') {
    if (type === 'start') {
      month = 1;
      if (year === 2021) day = 4;
      if (year === 2022) day = 3;
      if (year === 2023) day = 2;
      if (year === 2024) day = 1;
    } else if (type === 'end') {
      month = 4;
      if (year === 2021) day = 2;
      if (year === 2022) day = 1;
      if (year === 2023) day = 7;
      if (year === 2024) day = 5;
    }
  } else if (term === 'SUMMER') {
    if (type === 'start') {
      month = 5;
      if (year === 2021) day = 3;
      if (year === 2022) day = 2;
      if (year === 2023) day = 1;
      if (year === 2024) day = 6;
    } else if (type === 'end') {
      month = 8;
      if (year === 2021) day = 6;
      if (year === 2022) day = 5;
      if (year === 2023) day = 4;
      if (year === 2024) day = 2;
    }
  }

  const result = new Date(`${month}/${day}/${year}`);

  return result;
};

export const updateCourses = (
  courses: Algo1Course[],
  newCourses: (Course & {
    sectionCount: number;
  })[],
  term: Term,
  year: number
) => {
  courses.forEach(async ({ sequenceNumber: code, courseNumber, subject, assignment, prof }) => {
    // Match our new courses to the courses returned from algorithm 1
    const course = newCourses.find(
      (course) => course.code === courseNumber && course.subject === subject && course.term === term
    );
    if (!course || !assignment) return;

    const { sunday, monday, tuesday, wednesday, thursday, friday, saturday, beginTime, endTime, startDate, endDate } =
      assignment;

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

    // Update the database with the new capacity
    await (prisma as PrismaClient).course.update({
      where: {
        id: course.id,
      },
      data: {
        capacity: course.capacity,
      },
    });

    // Update the section with the new meeting times and start/end date
    await (prisma as PrismaClient).section.upsert({
      where: {
        code_courseId: {
          code,
          courseId: course.id,
        },
      },
      create: {
        code,
        course: {
          connect: {
            id: course.id,
          },
        },
        startDate: getCourseRangeDate('start', term, year),
        endDate: getCourseRangeDate('end', term, year),
        professor: {
          connect: {
            username: prof?.displayName,
          },
        },
        meetingTimes: {
          create: meetingTimes,
        },
      },
      update: {
        startDate: new Date(startDate) ?? new Date(),
        endDate: new Date(endDate) ?? new Date(),
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
};
