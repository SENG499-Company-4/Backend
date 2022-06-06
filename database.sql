CREATE DATABASE IF NOT EXISTS `backend`;
USE `backend`;

CREATE TYPE Role AS ENUM('ADMIN', 'USER');
CREATE TYPE Day AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE Term AS ENUM('FALL', 'SPRING', 'SUMMER');
CREATE TYPE Peng AS ENUM('NOTREQUIRED', 'PREFERRED', 'REQUIRED');

CREATE TABLE `Coefficients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `value` float[] NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `User` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` Role NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `Courses` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `subject` varchar(255) NOT NULL,
    `term` Term NOT NULL,
    `year` int(11) NOT NULL,
    `weekly_hours` float(5) NOT NULL,
    `capacity` int(11) NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `peng` Peng NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `MeetingTimes` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `course_id` FOREIGN KEY (`courseId`) REFERENCES `Courses` (`id`),
    `day` Day NOT NULL,
    `start_time` time NOT NULL,
    `end_time` time NOT NULL,
    `schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `Schedule` (`id`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `Preferences` (
    `user_id` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`),
    `course_id` FOREIGN KEY (`user_id`) REFERENCES `Course` (`id`),
    `rank` int(4) NOT NULL,
    PRIMARY KEY (`user_id`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ProfessorSettings` (
    `user_id` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`),
    `year` int(11) NOT NULL,
    `max_courses_fall` int(11) NOT NULL,
    `max_courses_spring` int(11) NOT NULL,
    `max_courses_summer` int(11) NOT NULL,
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `Schedules` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `year` int(5) NOT NULL,
    `created_at` datetime NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;