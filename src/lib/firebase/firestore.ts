
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
  limit
} from 'firebase/firestore';
import { db } from './config';
import type { Notice, Event, Student, Teacher, Fee, Admin } from '../types';

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
  const studentsCol = collection(db, 'students');
  const studentSnapshot = await getDocs(studentsCol);
  const studentList = studentSnapshot.docs.map(doc =>
    convertTimestampsToDates({ id: doc.id, ...doc.data() })
  );
  return studentList as Student[];
}

export async function getTeachers(): Promise<Teacher[]> {
  const teachersCol = collection(db, 'teachers');
  const teacherSnapshot = await getDocs(teachersCol);
  const teacherList = teacherSnapshot.docs.map(doc =>
    ({ id: doc.id, ...doc.data() })
  );
  return teacherList as Teacher[];
}

export async function getFees(): Promise<Fee[]> {
  const feesCol = collection(db, 'fees');
  const feeSnapshot = await getDocs(feesCol);
  const feeList = feeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return feeList as Fee[];
}

export async function addTeacher(teacher: Teacher): Promise<void> {
  const teacherDoc = doc(db, 'teachers', teacher.id);
  await setDoc(teacherDoc, teacher);
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
