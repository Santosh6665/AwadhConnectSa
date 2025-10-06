

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
  arrayRemove,
  runTransaction,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import type { Student, Teacher, Fee, Admin, Class, Section, DailyAttendance, Parent, AttendanceRecord, PreviousSession, FeeReceipt, TeacherDailyAttendance, ExamResult, ExamType, SalaryPayment, Event, Notice, FeeStructure, Family, StudyMaterial, AnnualResult } from '../types';
import { calculateOverallResult } from '../utils';

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

export async function getStudentsByAdmissionNumbers(admissionNumbers: string[]): Promise<Student[]> {
    if (admissionNumbers.length === 0) return [];
    const studentPromises = admissionNumbers.map(id => getStudentByAdmissionNumber(id));
    const results = await Promise.all(studentPromises);
    return results.filter((s): s is Student => s !== null);
}



export async function addStudent(studentData: Student): Promise<void> {
    const { admissionNumber, ...data } = studentData;
    const studentDocRef = doc(db, 'students', admissionNumber);
    const batch = writeBatch(db);

    const finalStudentData: Omit<Student, 'admissionNumber'> = {
        ...data,
    };
    
    const birthYear = new Date(data.dob).getFullYear();
    finalStudentData.password = `${data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1)}@${birthYear}`;
    finalStudentData.fees = { [data.className]: { transactions: [] } };
    finalStudentData.results = { [data.className]: { examResults: {} } };
    finalStudentData.previousDue = 0;


    batch.set(studentDocRef, finalStudentData);

    if (studentData.parentMobile) {
        const parentDocRef = doc(db, 'parents', studentData.parentMobile);
        const parentDocSnap = await getDoc(parentDocRef);

        if (parentDocSnap.exists()) {
            batch.update(parentDocRef, {
                children: arrayUnion(admissionNumber)
            });
        } else {
            const newParent: Parent = {
                id: studentData.parentMobile,
                name: studentData.parentName,
                phone: studentData.parentMobile,
                children: [admissionNumber],
                password: `${studentData.parentName.split(' ')[0]}@${new Date().getFullYear()}`,
            };
            batch.set(parentDocRef, newParent);
        }
    }
    
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

  await runTransaction(db, async (transaction) => {
    const studentSnap = await transaction.get(studentRef);
    if (!studentSnap.exists()) {
      throw new Error('Student not found');
    }

    const studentData = studentSnap.data() as Student;
    const currentClassName = studentData.className;
    const currentSession = studentData.session;
    
    // 1. Calculate final results and attendance for the session being archived
    const annualResultForClass = studentData.results?.[currentClassName];
    const { percentage: overallPercentage } = calculateOverallResult(annualResultForClass);

    const [startYear] = currentSession.split('-').map(Number);
    const sessionStartMonth = 3; // April (month 3)
    const sessionEndMonth = 2; // March (month 2) of next year
    
    let totalPresents = 0;
    let totalWorkingDays = 0;

    for (let i = 0; i < 12; i++) {
        const month = (sessionStartMonth + i) % 12;
        const year = month >= sessionStartMonth ? startYear : startYear + 1;
        const attendanceForMonth = await getAttendanceForMonth(admissionNumber, year, month);
        // This is a simplified calculation. A more robust one would fetch school holidays.
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // Assuming 4 Sundays a month as a rough estimate for non-working days
        totalWorkingDays += (daysInMonth - 4); 
        totalPresents += attendanceForMonth.filter(a => a.status === 'Present').length;
    }
    const attendancePercentage = totalWorkingDays > 0 ? (totalPresents / totalWorkingDays) * 100 : 0;


    // 2. Calculate final fee dues for the session
    const currentClassFeeData = studentData.fees?.[currentClassName];
    let currentClassDue = 0;
    if (carryForwardDues && currentClassFeeData) {
      const feeStructureRef = doc(db, 'settings', 'feeStructure');
      const feeStructureSnap = await getDoc(feeStructureRef);
      const defaultFeeStructure = feeStructureSnap.data() as { [key: string]: FeeStructure } | null;
      
      const structureToUse = currentClassFeeData.structure || defaultFeeStructure?.[currentClassName];
      if (structureToUse) {
          const annualFee = Object.values(structureToUse).reduce((sum, head) => sum + (head.amount * head.months), 0);
          const totalPaid = (currentClassFeeData.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
          const concession = currentClassFeeData.concession || 0;
          currentClassDue = Math.max(0, annualFee - concession - totalPaid);
      }
    }

    // 3. Create the historical record
    const previousSessionRecord: PreviousSession = {
      sessionId: `${studentData.admissionNumber}-${currentClassName}`,
      className: currentClassName,
      sectionName: studentData.sectionName,
      session: studentData.session,
      rollNo: studentData.rollNo,
      finalStatus: 'Promoted', // This could be based on percentage in the future
      dueFee: currentClassDue,
      attendancePercentage: attendancePercentage,
      overallPercentage: overallPercentage,
    };

    // 4. Prepare updates for the student document
    const newTotalPreviousDue = (studentData.previousDue || 0) + currentClassDue;

    const updates: Partial<Student> = {
      session: newSession,
      className: newClassName,
      sectionName: newSectionName,
      previousSessions: arrayUnion(previousSessionRecord),
      previousDue: newTotalPreviousDue,
      [`fees.${newClassName}`]: studentData.fees?.[newClassName] || { transactions: [] },
      [`results.${newClassName}`]: studentData.results?.[newClassName] || { examResults: {} },
    };

    // 5. Commit the transaction
    transaction.update(studentRef, updates);
  });
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

export async function getAllAttendance(): Promise<DailyAttendance[]> {
  const snapshot = await getDocs(collection(db, 'attendance'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyAttendance));
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

export async function addFeePayment(admissionNumber: string, className: string, amount: number, mode: FeeReceipt['mode'], remarks: string): Promise<void> {
    const studentRef = doc(db, 'students', admissionNumber);

    await runTransaction(db, async (transaction) => {
        const studentDoc = await transaction.get(studentRef);
        if (!studentDoc.exists()) {
            throw "Student document does not exist!";
        }

        const studentData = studentDoc.data() as Student;
        let currentPreviousDue = studentData.previousDue || 0;
        let remainingAmount = amount;
        
        let newPreviousDue = currentPreviousDue;
        let amountForCurrentClass = 0;

        if (currentPreviousDue > 0) {
            const amountToClearPrevious = Math.min(remainingAmount, currentPreviousDue);
            newPreviousDue -= amountToClearPrevious;
            remainingAmount -= amountToClearPrevious;
        }

        if (remainingAmount > 0) {
            amountForCurrentClass = remainingAmount;
        }
        
        const updates: any = {
            previousDue: newPreviousDue
        };

        if (amountForCurrentClass > 0) {
            const receipt: FeeReceipt = {
                id: `TXN-${Date.now()}`,
                amount: amountForCurrentClass,
                date: new Date().toLocaleDateString('en-GB'), // dd/MM/yyyy
                mode,
                remarks: `Paid ₹${amount}. Applied ₹${amountForCurrentClass} to current fees. ${remarks || ''}`.trim(),
            };
            const path = `fees.${className}.transactions`;
            updates[path] = arrayUnion(receipt);
        }
        
        transaction.update(studentRef, updates);
    });
}


export async function updateStudentFeeStructure(admissionNumber: string, className: string, structure: FeeStructure, concession: number): Promise<void> {
    const studentRef = doc(db, 'students', admissionNumber);
    const updates: any = {};
    updates[`fees.${className}.structure`] = structure;
    updates[`fees.${className}.concession`] = concession;
    await updateDoc(studentRef, updates);
}

// STUDY MATERIALS

export async function uploadStudyMaterialFile(file: File): Promise<string> {
    const storageRef = ref(storage, `study_materials/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}

export async function getStudyMaterials(filters?: { uploadedBy?: string; className?: string, subject?: string }): Promise<StudyMaterial[]> {
    const q = query(collection(db, 'study_materials'), orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    let materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyMaterial));

    if (filters) {
        materials = materials.filter(material => {
            const uploadedByMatch = !filters.uploadedBy || material.uploadedBy === filters.uploadedBy;
            const classMatch = !filters.className || material.className === filters.className;
            const subjectMatch = !filters.subject || material.subject === filters.subject;
            return uploadedByMatch && classMatch && subjectMatch;
        });
    }

    return materials;
}


export async function addStudyMaterial(materialData: Omit<StudyMaterial, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'study_materials'), materialData);
    return docRef.id;
}

export async function updateStudyMaterial(id: string, materialData: Partial<StudyMaterial>): Promise<void> {
    const materialRef = doc(db, 'study_materials', id);
    await updateDoc(materialRef, materialData);
}

export async function deleteStudyMaterial(id: string, fileUrl?: string): Promise<void> {
    const materialRef = doc(db, 'study_materials', id);
    await deleteDoc(materialRef);

    if (fileUrl) {
        try {
            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef);
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                console.warn(`File not found for deletion, but continuing: ${fileUrl}`);
            } else {
                throw error;
            }
        }
    }
}

export async function toggleMaterialCompleted(materialId: string, studentId: string): Promise<boolean> {
    const materialRef = doc(db, 'study_materials', materialId);
    const materialSnap = await getDoc(materialRef);
    
    if (!materialSnap.exists()) {
        throw new Error("Material not found");
    }

    const completedBy = materialSnap.data().completedBy || [];
    const isCompleted = completedBy.includes(studentId);

    if (isCompleted) {
        await updateDoc(materialRef, {
            completedBy: arrayRemove(studentId)
        });
        return false;
    } else {
        await updateDoc(materialRef, {
            completedBy: arrayUnion(studentId)
        });
        return true;
    }
}
