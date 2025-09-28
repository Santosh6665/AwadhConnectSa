
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
import type { Notice, Event, Student, Teacher, Fee, Admin, Class, Section } from '../types';

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
    ({ admissionNumber: doc.id, ...doc.data() })
  );
  return studentList as Student[];
}

export async function addStudent(studentData: Omit<Student, 'admissionNumber'>, admissionNumber: string): Promise<void> {
    const studentDocRef = doc(db, 'students', admissionNumber);
    await setDoc(studentDocRef, studentData);
}

export async function updateStudent(admissionNumber: string, studentData: Partial<Student>): Promise<void> {
    const studentDoc = doc(db, 'students', admissionNumber);
    await updateDoc(studentDoc, studentData);
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
    // ID is now provided in the form, so we use setDoc
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
  // Teachers are now stored with their ID as the document ID
  const teacherDocRef = doc(db, 'teachers', id);
  const teacherDocSnap = await getDoc(teacherDocRef);

  if (!teacherDocSnap.exists()) {
      // Fallback for old data structure if needed, can be removed later
      const q = query(collection(db, 'teachers'), where('id', '==', id), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
          return null;
      }
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Teacher;
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
