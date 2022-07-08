type Assignment = {
  startDate: string;
  endDate: string;
  beginTime: string;
  endTime: string;
  hoursWeek: number;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
};

type Preference = {
  courseNum: string;
  preferenceNum: number;
};

type Professor = {
  preferences: Preference[];
  displayName: string;
  fallTermCourses?: number;
  springTermCourses?: number;
  summerTermCourses?: number;
};

export type Algo1Course = {
  courseNumber: string;
  subject: string;
  sequenceNumber: string;
  streamSequence: string;
  courseTitle: string;
  courseCapacity: number;
  numSections: number;
  assignment?: Assignment;
  prof?: Professor;
};

export type Algorithm1 = {
  fallCourses: Algo1Course[];
  springCourses: Algo1Course[];
  summerCourses: Algo1Course[];
};

export type Algorithm2 = {
  subject: string;
  code: string;
  seng_ratio: number;
  semester: 'FALL' | 'SPRING' | 'SUMMER';
  capacity: number;
};
