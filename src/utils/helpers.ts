// Random integer in the range [0, max]
export const randomNumber = (max: number): number => Math.floor(Math.random() * max + 1);

// Partition a given amount randomly across 3 integers
export const partition = (amount: number) => {
  const maxCoursesFall = amount - randomNumber(amount);
  if (maxCoursesFall === 0) {
    const maxCoursesSpring = amount - randomNumber(amount);

    return { maxCoursesFall, maxCoursesSpring, maxCoursesSummer: amount - maxCoursesFall - maxCoursesSpring };
  } else if (maxCoursesFall >= amount / 2) {
    const validRange = amount - maxCoursesFall;
    const maxCoursesSpring = validRange - randomNumber(validRange);

    return { maxCoursesFall, maxCoursesSpring, maxCoursesSummer: amount - maxCoursesFall - maxCoursesSpring };
  } else {
    const maxCoursesSpring = maxCoursesFall - randomNumber(maxCoursesFall);

    return { maxCoursesFall, maxCoursesSpring, maxCoursesSummer: amount - maxCoursesFall - maxCoursesSpring };
  }
};
