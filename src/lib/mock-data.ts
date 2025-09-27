import type { Student, Teacher, Parent, Notice, Event, Fee } from './types';

export const mockTeachers: Teacher[] = [
  { 
    id: 'T01', 
    name: 'Dr. Evelyn Reed', 
    email: 'e.reed@awadh.edu', 
    phone: '555-0101', 
    subjects: ['Physics', 'Chemistry'], 
    salary: 75000, 
    dob: new Date('1985-05-20'),
    gender: 'Female',
    hireDate: new Date('2015-08-01'),
    designation: 'Senior Science Teacher',
    classes: ['10A', '10B', '11A'],
    status: 'Active'
  },
  { 
    id: 'T02', 
    name: 'Mr. Samuel Chen', 
    email: 's.chen@awadh.edu', 
    phone: '555-0102', 
    subjects: ['Mathematics'], 
    salary: 72000,
    dob: new Date('1990-11-12'),
    gender: 'Male',
    hireDate: new Date('2018-07-15'),
    designation: 'Mathematics Coordinator',
    classes: ['9A', '9B', '10A'],
    status: 'Active'
  },
  { 
    id: 'T03', 
    name: 'Ms. Maria Garcia', 
    email: 'm.garcia@awadh.edu', 
    phone: '555-0103', 
    subjects: ['History', 'Geography'], 
    salary: 73000,
    dob: new Date('1988-02-28'),
    gender: 'Female',
    hireDate: new Date('2017-03-10'),
    designation: 'Social Studies Teacher',
    classes: ['8A', '8B', '9A'],
    status: 'Active'
  },
  { 
    id: 'T04', 
    name: 'Mr. David Miller', 
    email: 'd.miller@awadh.edu', 
    phone: '555-0104', 
    subjects: ['English'], 
    salary: 71000,
    dob: new Date('1992-09-05'),
    gender: 'Male',
    hireDate: new Date('2020-09-01'),
    designation: 'English Teacher',
    classes: ['7A', '7B', '8A'],
    status: 'Archived'
  },
];

export const mockParents: Parent[] = [
  { id: 'P01', name: 'Mr. & Mrs. Sharma', email: 'sharma.fam@email.com', phone: '555-0201', children: ['S01'] },
  { id: 'P02', name: 'Mr. & Mrs. Khan', email: 'khan.fam@email.com', phone: '555-0202', children: ['S02'] },
  { id: 'P03', name: 'Ms. Priya Patel', email: 'priya.p@email.com', phone: '555-0203', children: ['S03'] },
  { id: 'P04', name: 'Mr. Alok Verma', email: 'alok.v@email.com', phone: '555-0204', children: ['S04'] },
];

export const mockStudents: Student[] = [
  { id: 'S01', rollNo: '10A01', firstName: 'Aarav', lastName: 'Sharma', dob: new Date('2009-05-15'), gender: 'Male', admissionNumber: 'AN2022001', classId: 'C10', sectionId: 'S10A', parentId: 'P01', feeStatus: 'Paid' },
  { id: 'S02', rollNo: '10A02', firstName: 'Zoya', lastName: 'Khan', dob: new Date('2009-08-22'), gender: 'Female', admissionNumber: 'AN2022002', classId: 'C10', sectionId: 'S10A', parentId: 'P02', feeStatus: 'Due' },
  { id: 'S03', rollNo: '10B01', firstName: 'Rohan', lastName: 'Patel', dob: new Date('2009-03-10'), gender: 'Male', admissionNumber: 'AN2022003', classId: 'C10', sectionId: 'S10B', parentId: 'P03', feeStatus: 'Paid' },
  { id: 'S04', rollNo: '09A01', firstName: 'Saanvi', lastName: 'Verma', dob: new Date('2010-11-30'), gender: 'Female', admissionNumber: 'AN2023001', classId: 'C09', sectionId: 'S09A', parentId: 'P04', feeStatus: 'Partial' },
];

export const mockNotices: Notice[] = [
  { id: 'N01', title: 'Annual Sports Day Postponed', description: 'The Annual Sports Day scheduled for Dec 15th has been postponed due to expected bad weather. New dates will be announced soon.', targetAudience: 'all', date: new Date('2024-12-10') },
  { id: 'N02', title: 'Parent-Teacher Meeting Schedule', description: 'The PTM for the final term will be held on January 10th, 2025, from 9 AM to 1 PM. All parents are requested to attend.', targetAudience: 'parent', date: new Date('2024-12-08') },
  { id: 'N03', title: 'Faculty Development Workshop', description: 'A workshop on "AI in Education" will be conducted for all teaching staff on Dec 20th.', targetAudience: 'teacher', date: new Date('2024-12-05') },
  { id: 'N04', title: 'Winter Vacation Art Competition', description: 'Submit your artwork for the winter-themed competition by January 5th. Details in the student portal.', targetAudience: 'student', date: new Date('2024-12-01') },
];

export const mockEvents: Event[] = [
  { id: 'E01', title: 'Science Fair 2024', description: 'Annual showcase of innovative science projects by students from classes 6-12.', startDate: new Date('2024-11-20'), endDate: new Date('2024-11-21'), targetAudience: 'all' },
  { id: 'E02', title: 'Winter Carnival', description: 'A day of fun, food, and games to celebrate the start of winter break.', startDate: new Date('2024-12-22'), endDate: new Date('2024-12-22'), targetAudience: 'all' },
  { id: 'E03', title: 'Republic Day Celebrations', description: 'Join us for the flag hoisting ceremony and cultural programs to celebrate Republic Day.', startDate: new Date('2025-01-26'), endDate: new Date('2025-01-26'), targetAudience: 'all' },
];

export const mockFees: Fee[] = [
    { studentId: 'S01', session: '2024-25', totalFee: 50000, paidFee: 50000, dueFee: 0 },
    { studentId: 'S02', session: '2024-25', totalFee: 50000, paidFee: 25000, dueFee: 25000 },
    { studentId: 'S03', session: '2024-25', totalFee: 50000, paidFee: 50000, dueFee: 0 },
    { studentId: 'S04', session: '2024-25', totalFee: 45000, paidFee: 40000, dueFee: 5000 },
];
