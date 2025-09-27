export interface Student {
  id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  dob: Date;
  gender: 'Male' | 'Female' | 'Other';
  admissionNumber: string;
  classId: string;
  sectionId: string;
  parentId: string;
  feeStatus: 'Paid' | 'Due' | 'Partial';
  attendance?: AttendanceRecord[];
  results?: Result[];
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[]; // array of studentIds
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[]; // array of subjectIds
  salary?: number;
  attendance?: AttendanceRecord[];
}

export interface Class {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
  classId: string;
}

export interface Subject {
  id: string;
  name: string;
  classId: string;
  teacherId: string;
}

export interface Fee {
  studentId: string;
  session: string;
  totalFee: number;
  paidFee: number;
  dueFee: number;
  receipts?: FeeReceipt[];
}

export interface FeeReceipt {
  id: string;
  amount: number;
  date: Date;
}

export interface Result {
  examType: 'Quarterly' | 'Half-Yearly' | 'Annual';
  subjectId: string;
  marksObtained: number;
  totalMarks: number;
}

export interface AttendanceRecord {
  date: Date;
  status: 'Present' | 'Absent';
  notes?: string;
}

export type NoticeAudience = 'student' | 'teacher' | 'parent' | 'all';

export interface Notice {
  id: string;
  title: string;
  description: string;
  targetAudience: NoticeAudience;
  date: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetAudience: NoticeAudience;
}

export interface StudyMaterial {
  id: string;
  title: string;
  fileUrl: string;
  classId: string;
  sectionId: string;
  uploadedBy: string; // teacherId
  date: Date;
}

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';
