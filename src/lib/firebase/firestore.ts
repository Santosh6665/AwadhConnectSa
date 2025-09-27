'use server';

import {
  collection,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { Notice, Event, Student, Teacher, Fee } from '../types';

// Helper to convert Firestore Timestamps to JS Dates
const convertTimestamps = (data: any) => {
  const anemicData = JSON.parse(JSON.stringify(data));
  for (const key in anemicData) {
    if (anemicData[key] && anemicData[key].seconds) {
      anemicData[key] = new Date(anemicData[key].seconds * 1000);
    }
  }
  return anemicData;
};

// Helper to convert date strings or Date objects to Firestore Timestamps
const convertToTimestamps = (data: any) => {
    const dataWithTimestamps = { ...data };
    for (const key in dataWithTimestamps) {
        if (dataWithTimestamps[key] && (typeof dataWithTimestamps[key] === 'string' && new Date(dataWithTimestamps[key]).toString() !== 'Invalid Date')) {
            dataWithTimestamps[key] = Timestamp.fromDate(new Date(dataWithTimestamps[key]));
        } else if (dataWithTimestamps[key] instanceof Date) {
            dataWithTimestamps[key] = Timestamp.fromDate(dataWithTimestamps[key]);
        }
    }
    return dataWithTimestamps;
}

export async function getNotices(): Promise<Notice[]> {
  const noticesCol = collection(db, 'notices');
  const noticeSnapshot = await getDocs(noticesCol);
  const noticeList = noticeSnapshot.docs.map(doc =>
    convertTimestamps({ id: doc.id, ...doc.data() })
  );
  return noticeList.sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  ) as Notice[];
}

export async function getEvents(): Promise<Event[]> {
  const eventsCol = collection(db, 'events');
  const eventSnapshot = await getDocs(eventsCol);
  const eventList = eventSnapshot.docs.map(doc =>
    convertTimestamps({ id: doc.id, ...doc.data() })
  );
  return eventList.sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  ) as Event[];
}

export async function getStudents(): Promise<Student[]> {
  const studentsCol = collection(db, 'students');
  const studentSnapshot = await getDocs(studentsCol);
  const studentList = studentSnapshot.docs.map(doc =>
    convertTimestamps({ id: doc.id, ...doc.data() })
  );
  return studentList as Student[];
}

export async function getTeachers(): Promise<Teacher[]> {
  const teachersCol = collection(db, 'teachers');
  const teacherSnapshot = await getDocs(teachersCol);
  const teacherList = teacherSnapshot.docs.map(doc =>
    convertTimestamps({ id: doc.id, ...doc.data() })
  );
  return teacherList as Teacher[];
}

export async function getFees(): Promise<Fee[]> {
  const feesCol = collection(db, 'fees');
  const feeSnapshot = await getDocs(feesCol);
  const feeList = feeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return feeList as Fee[];
}

export async function addTeacher(teacher: Teacher): Promise<Teacher> {
  const teacherDoc = doc(db, 'teachers', teacher.id);
  const dataToSave = convertToTimestamps(teacher);
  await setDoc(teacherDoc, dataToSave);
  return teacher;
}

export async function updateTeacher(
  id: string,
  teacher: Partial<Teacher>
): Promise<void> {
  const teacherDoc = doc(db, 'teachers', id);
  const dataToSave = convertToTimestamps(teacher);
  await updateDoc(teacherDoc, dataToSave);
}
