
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
} from 'firebase/firestore';
import { db } from './config';
import type { Notice, Event, Student, Teacher, Fee, Admin, Class, Section, Parent } from '../types';

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

export async function getStudents(): Promise<Student[]> {
  const q = query(collection(db, 'students'), where('status', '==', 'Active'));
  const studentSnapshot = await getDocs(q);
  const studentList = studentSnapshot.docs.map(doc =>
    ({ id: doc.id, ...doc.data() })
  );
  return studentList as Student[];
}

export async function addStudent(studentData: Omit<Student, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'students'), studentData);
    return docRef.id;
}

export async function updateStudent(id: string, studentData: Partial<Student>): Promise<void> {
    const studentDoc = doc(db, 'students', id);
    await updateDoc(studentDoc, studentData);
}

export async function promoteStudent(
  studentId: string,
  oldStudentData: Student,
  newClassId: string,
  newSectionId: string,
  newSession: string,
  carryOverDues: boolean
) {
  const batch = writeBatch(db);

  // 1. Archive the old student record
  const oldStudentRef = doc(db, 'students', studentId);
  const previousSession = {
    sessionId: `${oldStudentData.id}-${oldStudentData.session}`,
    classId: oldStudentData.classId,
    sectionId: oldStudentData.sectionId,
    session: oldStudentData.session,
    rollNo: oldStudentData.rollNo,
    finalStatus: 'Promoted',
  };
  batch.update(oldStudentRef, { 
    status: 'Archived', 
    previousSessions: [...(oldStudentData.previousSessions || []), previousSession]
  });

  // 2. Create the new student record for the new session
  const newStudentData: Omit<Student, 'id'> = {
      ...oldStudentData,
      classId: newClassId,
      sectionId: newSectionId,
      session: newSession,
      status: 'Active',
      previousSessions: [], // This will be on the new document eventually, starting fresh
  };
  const newStudentRef = doc(collection(db, 'students'));
  batch.set(newStudentRef, newStudentData);

  // 3. Handle fees
  if (carryOverDues) {
      const oldFeeQuery = query(
          collection(db, 'fees'), 
          where('studentId', '==', studentId), 
          where('session', '==', oldStudentData.session)
      );
      const oldFeeSnapshot = await getDocs(oldFeeQuery);
      if (!oldFeeSnapshot.empty) {
          const oldFeeData = oldFeeSnapshot.docs[0].data() as Fee;
          if (oldFeeData.dueFee > 0) {
              const newFeeRef = doc(collection(db, 'fees'));
              const newFeeData = {
                  studentId: newStudentRef.id, // Link to the new student doc
                  session: newSession,
                  totalFee: 50000, // This should be dynamic based on class
                  paidFee: 0,
                  dueFee: oldFeeData.dueFee, // Carry over the due amount
              };
              batch.set(newFeeRef, newFeeData);
          }
      }
  }

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

export async function addTeacher(teacher: Omit<Teacher, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'teachers'), teacher);
    // You might want to update the document with its own ID if needed, but for now just return it.
    return docRef.id;
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


// Functions to fetch classes, sections, parents for dropdowns
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

export async function getParents(): Promise<Parent[]> {
  const parentsCol = collection(db, 'parents');
  const parentSnapshot = await getDocs(parentsCol);
  return parentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Parent));
}

export async function getFees(): Promise<Fee[]> {
  const feesCol = collection(db, 'fees');
  const feeSnapshot = await getDocs(feesCol);
  const feeList = feeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return feeList as Fee[];
}
