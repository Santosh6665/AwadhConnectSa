'use server';

import { mockEvents, mockNotices, mockStudents, mockTeachers, mockFees } from '../mock-data';
import { Notice, Event, Student, Teacher, Fee } from '../types';

// In a real application, these functions would interact with Firebase Firestore.
// For this example, we are returning mock data.

export async function getNotices(): Promise<Notice[]> {
  // Mocking an async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockNotices.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getEvents(): Promise<Event[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export async function getStudents(): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockStudents;
}

export async function getTeachers(): Promise<Teacher[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockTeachers;
}

export async function getFees(): Promise<Fee[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockFees;
}
