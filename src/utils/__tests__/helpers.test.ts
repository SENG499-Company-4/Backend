import { partition, randomNumber } from '../helpers';

describe('randomNumber', () => {
  it('should always return a random number between 0 and 6', () => {
    const max = 6;

    expect(randomNumber(max)).toBeLessThanOrEqual(max);
    expect(randomNumber(max)).toBeLessThanOrEqual(max);
    expect(randomNumber(max)).toBeLessThanOrEqual(max);
    expect(randomNumber(max)).toBeLessThanOrEqual(max);
    expect(randomNumber(max)).toBeGreaterThanOrEqual(0);
    expect(randomNumber(max)).toBeGreaterThanOrEqual(0);
    expect(randomNumber(max)).toBeGreaterThanOrEqual(0);
    expect(randomNumber(max)).toBeGreaterThanOrEqual(0);
  });

  it('should always return a random number between 0 and 1', () => {
    const max = 1;

    expect(randomNumber(max)).toBeLessThanOrEqual(max);
    expect(randomNumber(max)).toBeLessThanOrEqual(max);
    expect(randomNumber(max)).toBeLessThanOrEqual(max);
    expect(randomNumber(max)).toBeLessThanOrEqual(max);
    expect(randomNumber(max)).toBeGreaterThanOrEqual(0);
    expect(randomNumber(max)).toBeGreaterThanOrEqual(0);
    expect(randomNumber(max)).toBeGreaterThanOrEqual(0);
    expect(randomNumber(max)).toBeGreaterThanOrEqual(0);
  });
});

describe('partition', () => {
  it('should return 3 elements where the sum is always equal to 5', () => {
    const { maxCoursesFall, maxCoursesSpring, maxCoursesSummer } = partition(5);

    expect(maxCoursesFall + maxCoursesSpring + maxCoursesSummer).toStrictEqual(5);
  });

  it('should return 3 elements where the sum is always equal to 3', () => {
    const { maxCoursesFall, maxCoursesSpring, maxCoursesSummer } = partition(3);

    expect(maxCoursesFall + maxCoursesSpring + maxCoursesSummer).toStrictEqual(3);
  });

  it('should return 3 elements where the sum is always equal to 1234', () => {
    const { maxCoursesFall, maxCoursesSpring, maxCoursesSummer } = partition(1234);

    expect(maxCoursesFall + maxCoursesSpring + maxCoursesSummer).toStrictEqual(1234);
  });

  it('should return 3 elements where the sum is always equal to 0', () => {
    const { maxCoursesFall, maxCoursesSpring, maxCoursesSummer } = partition(0);

    expect(maxCoursesFall + maxCoursesSpring + maxCoursesSummer).toStrictEqual(0);
  });
});
