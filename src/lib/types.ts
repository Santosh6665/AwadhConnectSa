


export interface Student {
  admissionNumber: string; // Document ID
  rollNo: string;
  firstName: string;
  lastName: string;
  dob: string; // Stored as 'dd/MM/yyyy'
  gender: 'Male' | 'Female' | 'Other';
  className: string;
  sectionName: string;
  parentName: string;
  parentMobile?: string;
  status: 'Active' | 'Archived';
  session: string; // e.g., '2024-25'
  
  // New structured data for fees and results, keyed by class name
  fees: { [className: string]: FeeReceipt[] };
  results: { [session: string]: AnnualResult };

  // Optional fields
  password?: string;
  previousSessions?: PreviousSession[];
}

export interface AnnualResult {
  examResults: {
    Quarterly?: ExamResult;
    'Half-Yearly'?: ExamResult;
    Annual?: ExamResult;
  };
  rank?: number;
}

export type ExamType = 'Quarterly' | 'Half-Yearly' | 'Annual';

export interface ExamResult {
  examType: ExamType;
  subjects: SubjectResult[];
}

export interface SubjectResult {
  subjectName: string;
  maxMarks: number;
  obtainedMarks: number;
}


export interface PreviousSession {
  sessionId: string; // e.g., 'S01-2023-24'
  className: string;
  sectionName: string;
  session: string;
  rollNo: string;
  finalStatus: 'Promoted' | 'Retained';
  dueFee: number;
}


export interface Parent {
  id: string; // mobile number
  name: string;
  phone: string;
  children: string[]; // array of student admission numbers
  password?: string;
  email?: string;
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
  date: string; // dd/MM/yyyy
  status: 'Paid' | 'Due' | 'Partial';
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Unmarked';

export interface AttendanceRecord {
  studentId: string; // Can be student admissionNumber or teacherId
  status: AttendanceStatus;
  date?: string; // YYYY-MM-DD - Optional, used for history fetching
}

export interface DailyAttendance {
  id: string; // YYYY-MM-DD_className_sectionName
  date: string; // YYYY-MM-DD
  className: string;
  sectionName: string;
  session: string;
  takenBy: string; // teacherId
  records: AttendanceRecord[];
}

export interface TeacherDailyAttendance {
  id: string; // teachers_YYYY-MM-DD
  date: string; // YYYY-MM-DD
  takenBy: string; // admin email
  records: AttendanceRecord[];
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
  // For teacher/student/parent role
  id?: string; 
  name?: string;
}

export interface SalaryPayment {
  id: string; // e.g., T01_2024-08
  teacherId: string;
  month: number;
  year: number;
  status: 'Paid' | 'Pending';
  paymentDate?: string;
  paymentMode?: 'Bank Transfer' | 'Cheque' | 'Cash';
  amount: number;
}
