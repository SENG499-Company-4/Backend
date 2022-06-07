-- CreateEnum
CREATE TYPE "Peng" AS ENUM ('NOTREQUIRED', 'PREFERRED', 'REQUIRED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Term" AS ENUM ('FALL', 'SPRING', 'SUMMER');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('FRIDAY', 'MONDAY', 'SATURDAY', 'SUNDAY', 'THURSDAY', 'TUESDAY', 'WEDNESDAY');

-- CreateTable
CREATE TABLE "Coefficients" (
    "subject" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "value" DOUBLE PRECISION[],

    CONSTRAINT "Coefficients_pkey" PRIMARY KEY ("subject","code")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'USER',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Courses" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "year" INTEGER NOT NULL,
    "weeklyHours" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "peng" "Peng" NOT NULL,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingTimes" (
    "id" SERIAL NOT NULL,
    "courseID" INTEGER NOT NULL,
    "day" "Day" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "scheduleID" INTEGER NOT NULL,

    CONSTRAINT "MeetingTimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedules" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preferences" (
    "userID" INTEGER NOT NULL,
    "courseID" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("userID","courseID")
);

-- CreateTable
CREATE TABLE "ProfessorSettings" (
    "userID" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "maxCoursesFall" INTEGER NOT NULL,
    "maxCoursesSpring" INTEGER NOT NULL,
    "maxCoursesSummer" INTEGER NOT NULL,

    CONSTRAINT "ProfessorSettings_pkey" PRIMARY KEY ("userID")
);

-- AddForeignKey
ALTER TABLE "MeetingTimes" ADD CONSTRAINT "MeetingTimes_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTimes" ADD CONSTRAINT "MeetingTimes_scheduleID_fkey" FOREIGN KEY ("scheduleID") REFERENCES "Schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorSettings" ADD CONSTRAINT "ProfessorSettings_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
