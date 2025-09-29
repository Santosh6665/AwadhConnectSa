
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
  startAt,
  endAt,
  orderBy,
  deleteField,
  collectionGroup,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { Student, Teacher, Fee, Admin, Class, Section, DailyAttendance, Parent, AttendanceRecord, PreviousSession, FeeReceipt, TeacherDailyAttendance, ExamResult, ExamType, SalaryPayment, Event, Notice, FeeStructure, Family } from '../types';

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

// NOTICES & EVENTS
export async function getNotices(limitCount?: number): Promise<Notice[]> {
  let q = query(collection(db, 'notices'), orderBy('date', 'desc'));
  if(limitCount) {
    q = query(q, limit(limitCount));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
}

export async function addNotice(noticeData: Omit<Notice, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notices'), noticeData);
    return docRef.id;
}

export async function updateNotice(id: string, noticeData: Partial<Notice>): Promise<void> {
    const noticeRef = doc(db, 'notices', id);
    await updateDoc(noticeRef, noticeData);
}

export async function deleteNotice(id: string): Promise<void> {
    const noticeRef = doc(db, 'notices', id);
    await deleteDoc(noticeRef);
}

export async function getEvents(limitCount?: number): Promise<Event[]> {
  let q = query(collection(db, 'events'), orderBy('startDate', 'desc'));
  if(limitCount) {
    q = query(q, limit(limitCount));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
}

export async function addEvent(eventData: Omit<Event, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'events'), eventData);
    return docRef.id;
}

export async function updateEvent(id: string, eventData: Partial<Event>): Promise<void> {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, eventData);
}

export async function deleteEvent(id: string): Promise<void> {
    const eventRef = doc(db, 'events', id);
    await deleteDoc(eventRef);
}


export async function getStudents(filters?: { className?: string; sectionName?: string; status?: 'Active' | 'Archived', admissionNumber?: string }): Promise<Student[]> {
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
  if (filters?.admissionNumber) {
    q = query(q, where('admissionNumber', '==', filters.admissionNumber));
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


export async function addStudent(studentData: Student): Promise<void> {
    const { admissionNumber, ...data } = studentData;
    const studentDocRef = doc(db, 'students', admissionNumber);
    const batch = writeBatch(db);

    const finalStudentData: Omit<Student, 'admissionNumber'> = {
        ...data,
    };
    
    // For new students, create a password and initialize fees/results
    const birthYear = new Date(data.dob).getFullYear();
    finalStudentData.password = `${data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1)}@${birthYear}`;
    finalStudentData.fees = { [data.className]: { transactions: [] } };
    finalStudentData.results = { [data.className]: { examResults: {} } };


    // 1. Set student document
    batch.set(studentDocRef, finalStudentData);

    // 2. Handle parent document creation/update
    if (studentData.parentMobile) {
        const parentDocRef = doc(db, 'parents', studentData.parentMobile);
        const parentDocSnap = await getDoc(parentDocRef);

        if (parentDocSnap.exists()) {
            // Parent exists, update their children array
            batch.update(parentDocRef, {
                children: arrayUnion(admissionNumber)
            });
        } else {
            // Parent does not exist, create new parent document
            const newParent: Parent = {
                id: studentData.parentMobile,
                name: studentData.parentName,
                phone: studentData.parentMobile,
                children: [admissionNumber],
                password: `${studentData.parentName.split(' ')[0]}@${new Date().getFullYear()}`, // Default password
            };
            batch.set(parentDocRef, newParent);
        }
    }
    
    // 3. Commit batch
    await batch.commit();
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
  const currentClassFeeData = studentData.fees?.[studentData.className] || { transactions: [], structure: {}, concession: 0 };
  
  let dueFee = 0;
  if(carryForwardDues) {
    // This logic needs to be more robust, fetching the fee structure to calculate accurately.
    // For now, it's a placeholder.
  }
  
  const previousSessionRecord: PreviousSession = {
    sessionId: `${studentData.admissionNumber}-${studentData.session}`,
    className: studentData.className,
    sectionName: studentData.sectionName,
    session: studentData.session,
    rollNo: studentData.rollNo,
    finalStatus: 'Promoted',
    dueFee: dueFee,
  };

  const newFees = studentData.fees;
  if (!newFees[newClassName]) {
    newFees[newClassName] = { transactions: [] };
  }

  const newResults = studentData.results;
  if (!newResults[newClassName]) {
    newResults[newClassName] = { examResults: {} };
  }

  const batch = writeBatch(db);

  batch.update(studentRef, {
    session: newSession,
    className: newClassName,
    sectionName: newSectionName,
    previousSessions: arrayUnion(previousSessionRecord),
    fees: newFees,
    results: newResults,
  });

  await batch.commit();
}


export async function getTeachers(filters?: { status?: 'Active' | 'Archived' }): Promise<Teacher[]> {
  let q = query(collection(db, 'teachers'));

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  const teacherSnapshot = await getDocs(q);
  const teacherList = teacherSnapshot.docs.map(doc =>
    ({ id: doc.id, ...doc.data() })
  );
  return teacherList as Teacher[];
}

export async function addTeacher(teacher: Teacher): Promise<string> {
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


export async function getParentByMobile(mobile: string): Promise<Parent | null> {
  const parentDocRef = doc(db, 'parents', mobile);
  const parentDocSnap = await getDoc(parentDocRef);

  if (!parentDocSnap.exists()) {
      return null;
  }

  return { id: parentDocSnap.id, ...parentDocSnap.data() } as Parent;
}

export async function getParentsWithStudentData(): Promise<Family[]> {
    const parentsRef = collection(db, 'parents');
    const parentSnap = await getDocs(parentsRef);
    
    const families: Family[] = [];

    for (const parentDoc of parentSnap.docs) {
        const parentData = parentDoc.data() as Parent;
        const studentPromises = parentData.children.map(id => getStudentByAdmissionNumber(id));
        const studentResults = await Promise.all(studentPromises);
        const students = studentResults.filter((s): s is Student => s !== null);

        families.push({ ...parentData, students });
    }
    
    return families;
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

export async function getAttendanceForMonth(studentId: string, year: number, month: number): Promise<AttendanceRecord[]> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const attendanceCol = collection(db, 'attendance');
  const q = query(attendanceCol, where('date', '>=', startStr), where('date', '<=', endStr));

  const querySnapshot = await getDocs(q);
  const studentAttendanceRecords: AttendanceRecord[] = [];

  querySnapshot.forEach(doc => {
      const dailyData = doc.data() as DailyAttendance;
      const record = dailyData.records.find(r => r.studentId === studentId);
      if (record) {
          studentAttendanceRecords.push({
              studentId: record.studentId,
              status: record.status,
              date: dailyData.date,
          });
      }
  });

  return studentAttendanceRecords;
}

// Teacher Attendance
export async function saveTeacherAttendance(attendanceData: { date: string; takenBy: string; records: AttendanceRecord[] }): Promise<void> {
    const { date } = attendanceData;
    const docId = `teachers_${date}`;
    const attendanceRef = doc(db, 'teacher_attendance', docId);
    await setDoc(attendanceRef, attendanceData);
}

export async function getTeacherAttendance(date: string): Promise<TeacherDailyAttendance | null> {
    const docId = `teachers_${date}`;
    const attendanceRef = doc(db, 'teacher_attendance', docId);
    const docSnap = await getDoc(attendanceRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as TeacherDailyAttendance;
    }
    return null;
}

export async function getTeacherAttendanceForMonth(teacherId: string, year: number, month: number): Promise<AttendanceRecord[]> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const attendanceCol = collection(db, 'teacher_attendance');
  const q = query(attendanceCol, where('date', '>=', startStr), where('date', '<=', endStr));

  const querySnapshot = await getDocs(q);
  const teacherAttendanceRecords: AttendanceRecord[] = [];

  querySnapshot.forEach(doc => {
      const dailyData = doc.data() as TeacherDailyAttendance;
      const record = dailyData.records.find(r => r.studentId === teacherId); // studentId is teacherId here
      if (record) {
          teacherAttendanceRecords.push({
              studentId: record.studentId,
              status: record.status,
              date: dailyData.date,
          });
      }
  });

  return teacherAttendanceRecords;
}

export async function saveStudentResults(admissionNumber: string, className: string, examResult: ExamResult): Promise<void> {
  const studentRef = doc(db, 'students', admissionNumber);
  const path = `results.${className}.examResults.${examResult.examType}`;
  
  await updateDoc(studentRef, {
    [path]: examResult,
  });
}

export async function deleteStudentResults(admissionNumber: string, className: string, examType: ExamType): Promise<void> {
  const studentRef = doc(db, 'students', admissionNumber);
  const updatePath = `results.${className}.examResults.${examType}`;
  
  await updateDoc(studentRef, {
    [updatePath]: deleteField(),
  });
}


// SALARY MANAGEMENT

export async function getSalaryPaymentsForMonth(year: number, month: number): Promise<SalaryPayment[]> {
    const salaryPaymentsCol = collection(db, 'salaryPayments');
    const q = query(salaryPaymentsCol, where('year', '==', year), where('month', '==', month));
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return [];
    }

    return querySnapshot.docs.map(doc => doc.data() as SalaryPayment);
}

export async function getSalaryPaymentForTeacher(teacherId: string, year: number, month: number): Promise<SalaryPayment | null> {
    const docId = `${teacherId}_${year}-${month}`;
    const paymentRef = doc(db, 'salaryPayments', docId);
    const docSnap = await getDoc(paymentRef);
    if (docSnap.exists()) {
        return docSnap.data() as SalaryPayment;
    }
    return null;
}


export async function saveSalaryPayment(paymentData: SalaryPayment): Promise<void> {
    const docId = `${paymentData.teacherId}_${paymentData.year}-${paymentData.month}`;
    const paymentRef = doc(db, 'salaryPayments', docId);
    await setDoc(paymentRef, paymentData, { merge: true });
}

// SETTINGS & FEES
export async function saveFeeStructure(feeStructure: {[className: string]: FeeStructure}): Promise<void> {
    const docData: any = {};
    Object.keys(feeStructure).forEach(className => {
      docData[className] = feeStructure[className];
    });
    const settingsRef = doc(db, 'settings', 'feeStructure');
    await setDoc(settingsRef, docData);
}

export async function getFeeStructure(): Promise<{[className: string]: FeeStructure} | null> {
    const settingsRef = doc(db, 'settings', 'feeStructure');
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
        return docSnap.data() as {[className: string]: FeeStructure};
    }
    return null;
}

export async function addFeePayment(admissionNumber: string, className: string, transaction: FeeReceipt): Promise<void> {
    const studentRef = doc(db, 'students', admissionNumber);
    const path = `fees.${className}.transactions`;
    await updateDoc(studentRef, {
        [path]: arrayUnion(transaction)
    });
}

export async function updateStudentFeeStructure(admissionNumber: string, className: string, structure: FeeStructure, concession: number): Promise<void> {
    const studentRef = doc(db, 'students', admissionNumber);
    const updates: any = {};
    updates[`fees.${className}.structure`] = structure;
    updates[`fees.${className}.concession`] = concession;
    await updateDoc(studentRef, updates);
}
