
export interface Student {
  id: string; // Auto-generated Firestore ID
  rollNo: string;
  firstName: string;
  lastName: string;
  dob: string; // Stored as 'dd/MM/yyyy'
  gender: 'Male' | 'Female' | 'Other';
  admissionNumber: string;
  classId: string;
  sectionId: string;
  parentId: string;
  feeStatus: 'Paid' | 'Due' | 'Partial';
  status: 'Active' | 'Archived';
  session: string; // e.g., '2024-25'
  
  // Optional fields
  password?: string;
  previousSessions?: PreviousSession[];
  attendance?: AttendanceRecord[];
  results?: Result[];
}

export interface PreviousSession {
  sessionId: string; // e.g., 'S01-2023-24'
  classId: string;
  sectionId: string;
  session: string;
  rollNo: string;
  finalStatus: 'Promoted' | 'Retained';
}


export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[]; // array of studentIds
}

export interface Teacher {
  id: string; // Teacher ID / Employee ID
  name: string; // Full Name
  email: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  hireDate: string;
  designation: string;
  subjects: string[]; // array of subjectIds
  classes: string[]; // e.g., ['9A', '10B']
  status: 'Active' | 'Archived';
  salary?: number;
  attendance?: AttendanceRecord[];
  password?: string;
}

export interface Class {
  id: string;
  name: string; // e.g., 'Class 10'
}

export interface Section {
  id: string;
  name: string; // e.g., 'A'
  classId: string;
}

export interface Subject {
  id: string;
  name:string;
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

export interface Admin {
  email: string;
  password?: string; // This is a hash
}

export interface AppUser {
  email?: string;
  role: UserRole;
  id?: string; // teacherId for teacher role
}
