-- CreateEnum
CREATE TYPE "Peng" AS ENUM ('NOTREQUIRED', 'PREFERRED', 'REQUIRED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Term" AS ENUM ('FALL', 'SPRING', 'SUMMER');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('FRIDAY', 'MONDAY', 'SATURDAY', 'SUNDAY', 'THURSDAY', 'TUESDAY', 'WEDNESDAY');

-- CreateTable
CREATE TABLE "Coefficient" (
    "subject" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "value" DOUBLE PRECISION[],

    CONSTRAINT "Coefficient_pkey" PRIMARY KEY ("subject","code")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "year" INTEGER NOT NULL,
    "weeklyHours" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "peng" "Peng" NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingTime" (
    "id" TEXT NOT NULL,
    "courseID" TEXT NOT NULL,
    "day" "Day",
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "scheduleID" TEXT NOT NULL,

    CONSTRAINT "MeetingTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "userID" TEXT NOT NULL,
    "courseID" INTEGER NOT NULL,
    "rank" INTEGER,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("userID","courseID")
);

-- CreateTable
CREATE TABLE "ProfessorSettings" (
    "userID" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "maxCoursesFall" INTEGER NOT NULL,
    "maxCoursesSpring" INTEGER NOT NULL,
    "maxCoursesSummer" INTEGER NOT NULL,

    CONSTRAINT "ProfessorSettings_pkey" PRIMARY KEY ("userID")
);

-- AddForeignKey
ALTER TABLE "MeetingTime" ADD CONSTRAINT "MeetingTime_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTime" ADD CONSTRAINT "MeetingTime_scheduleID_fkey" FOREIGN KEY ("scheduleID") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorSettings" ADD CONSTRAINT "ProfessorSettings_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
