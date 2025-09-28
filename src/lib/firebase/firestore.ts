

'use server';

import {
  collection,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  query,
  where,
  limit,
  addDoc,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './config';
import type { Notice, Event, Student, Teacher, Fee, Admin, Class, Section, DailyAttendance } from '../types';

// Helper to convert Firestore Timestamps to JS Dates for client-side use
const convertTimestampsToDates = (data: any) => {
  const anemicData = JSON.parse(JSON.stringify(data));
  for (const key in anemicData) {
    if (anemicData[key] && anemicData[key].seconds) {
      anemicData[key] = new Date(anemicData[key].seconds * 1000);
    }
  }
  return anemicData;
};

export async function getNotices(): Promise<Notice[]> {
  const noticesCol = collection(db, 'notices');
  const noticeSnapshot = await getDocs(noticesCol);
  const noticeList = noticeSnapshot.docs.map(doc =>
    convertTimestampsToDates({ id: doc.id, ...doc.data() })
  );
  return noticeList.sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  ) as Notice[];
}

export async function getEvents(): Promise<Event[]> {
  const eventsCol = collection(db, 'events');
  const eventSnapshot = await getDocs(eventsCol);
  const eventList = eventSnapshot.docs.map(doc =>
    convertTimestampsToDates({ id: doc.id, ...doc.data() })
  );
  return eventList.sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  ) as Event[];
}

export async function getStudents(filters?: { className?: string; sectionName?: string; status?: 'Active' | 'Archived' }): Promise<Student[]> {
  let q = query(collection(db, 'students'));

  if (filters?.className) {
    q = query(q, where('className', '==', filters.className));
  }
  if (filters?.sectionName) {
    q = query(q, where('sectionName', '==', filters.sectionName));
  }
   if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  const studentSnapshot = await getDocs(q);
  const studentList = studentSnapshot.docs.map(doc =>
    ({ admissionNumber: doc.id, ...doc.data() })
  );
  return studentList as Student[];
}


export async function getStudentByAdmissionNumber(admissionNumber: string): Promise<Student | null> {
  const studentDocRef = doc(db, 'students', admissionNumber);
  const studentDocSnap = await getDoc(studentDocRef);

  if (!studentDocSnap.exists()) {
    return null;
  }

  return { admissionNumber: studentDocSnap.id, ...studentDocSnap.data() } as Student;
}


export async function addStudent(studentData: Omit<Student, 'admissionNumber'>, admissionNumber: string): Promise<void> {
    const studentDocRef = doc(db, 'students', admissionNumber);
    await setDoc(studentDocRef, studentData);
}

export async function updateStudent(admissionNumber: string, studentData: Partial<Student>): Promise<void> {
    const studentDoc = doc(db, 'students', admissionNumber);
    await updateDoc(studentDoc, studentData);
}

export async function promoteStudent(
  admissionNumber: string,
  newSession: string,
  newClassName: string,
  newSectionName: string,
  carryForwardDues: boolean
): Promise<void> {
  const studentRef = doc(db, 'students', admissionNumber);
  const studentSnap = await getDoc(studentRef);

  if (!studentSnap.exists()) {
    throw new Error('Student not found');
  }

  const studentData = studentSnap.data() as Student;
  const currentFees = studentData.fees[studentData.className] || [];
  const lastReceipt = currentFees.length > 0 ? currentFees[currentFees.length - 1] : null;
  const dueFee = lastReceipt?.status === 'Due' ? lastReceipt.amount : 0;

  const previousSessionRecord = {
    sessionId: `${studentData.admissionNumber}-${studentData.session}`,
    className: studentData.className,
    sectionName: studentData.sectionName,
    session: studentData.session,
    rollNo: studentData.rollNo,
    finalStatus: 'Promoted',
    dueFee: dueFee,
  };

  const newFees = { ...studentData.fees };
  let newFeeReceipts = [];

  if (carryForwardDues && dueFee > 0) {
    newFeeReceipts.push({
      id: `receipt-${Date.now()}`,
      amount: dueFee,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Due',
    });
  }
  newFees[newClassName] = newFeeReceipts;

  const batch = writeBatch(db);

  batch.update(studentRef, {
    session: newSession,
    className: newClassName,
    sectionName: newSectionName,
    // Add current session details to the `previousSessions` array
    previousSessions: arrayUnion(previousSessionRecord),
    fees: newFees,
    results: { ...studentData.results, [newClassName]: [] },
  });

  await batch.commit();
}


export async function getTeachers(): Promise<Teacher[]> {
  const teachersCol = collection(db, 'teachers');
  const teacherSnapshot = await getDocs(teachersCol);
  const teacherList = teacherSnapshot.docs.map(doc =>
    ({ id: doc.id, ...doc.data() })
  );
  return teacherList as Teacher[];
}

export async function addTeacher(teacher: Omit<Teacher, 'id'> & {id: string}): Promise<string> {
    const teacherRef = doc(db, 'teachers', teacher.id);
    await setDoc(teacherRef, teacher);
    return teacher.id;
}


export async function updateTeacher(
  id: string,
  teacher: Partial<Teacher>
): Promise<void> {
  const teacherDoc = doc(db, 'teachers', id);
  await updateDoc(teacherDoc, teacher);
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const adminDocRef = doc(db, 'admins', email);
  const adminDocSnap = await getDoc(adminDocRef);

  if (!adminDocSnap.exists()) {
    return null;
  }

  return adminDocSnap.data() as Admin;
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const teacherDocRef = doc(db, 'teachers', id);
  const teacherDocSnap = await getDoc(teacherDocRef);

  if (!teacherDocSnap.exists()) {
      return null;
  }

  return { id: teacherDocSnap.id, ...teacherDocSnap.data() } as Teacher;
}


// Functions to fetch classes, sections for dropdowns
export async function getClasses(): Promise<Class[]> {
  const classesCol = collection(db, 'classes');
  const classSnapshot = await getDocs(classesCol);
  return classSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
}

export async function getSections(): Promise<Section[]> {
  const sectionsCol = collection(db, 'sections');
  const sectionSnapshot = await getDocs(sectionsCol);
  return sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
}

export async function getFees(): Promise<Fee[]> {
  const feesCol = collection(db, 'fees');
  const feeSnapshot = await getDocs(feesCol);
  const feeList = feeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return feeList as Fee[];
}


export async function saveAttendance(attendanceData: Omit<DailyAttendance, 'id'>): Promise<void> {
    const { date, className, sectionName } = attendanceData;
    const docId = `${date}_${className}_${sectionName}`;
    const attendanceRef = doc(db, 'attendance', docId);
    await setDoc(attendanceRef, attendanceData);
}

export async function getAttendance(date: string, className: string, sectionName: string): Promise<DailyAttendance | null> {
    const docId = `${date}_${className}_${sectionName}`;
    const attendanceRef = doc(db, 'attendance', docId);
    const docSnap = await getDoc(attendanceRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DailyAttendance;
    }
    return null;
}
