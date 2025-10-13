
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AnnualResult, ExamType, Student, FeeStructure } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 33) return 'E';
  return 'F';
};

export const calculateOverallResult = (annualResult?: AnnualResult, examType?: ExamType): { percentage: number; grade: string } => {
    if (!annualResult || !annualResult.examResults) {
        return { percentage: 0, grade: 'N/A' };
    }

    let examToCalculate;

    if (examType) {
        examToCalculate = annualResult.examResults[examType];
    } else {
        const examResults = Object.values(annualResult.examResults);
        examToCalculate = examResults[examResults.length - 1];
    }
    
    if (!examToCalculate || !examToCalculate.subjects || examToCalculate.subjects.length === 0) {
        return { percentage: 0, grade: 'N/A' };
    }

    let totalObtained = 0;
    let totalMax = 0;

    examToCalculate.subjects.forEach(sub => {
        totalObtained += sub.obtainedMarks;
        totalMax += sub.maxMarks;
    });

    if (totalMax === 0) {
        return { percentage: 0, grade: 'N/A' };
    }

    const percentage = (totalObtained / totalMax) * 100;
    const grade = getGrade(percentage);

    return { percentage, grade };
};


export const calculateGrandTotalResult = (annualResult?: AnnualResult): { percentage: number; grade: string } => {
    if (!annualResult || !annualResult.examResults) {
        return { percentage: 0, grade: 'N/A' };
    }

    let grandTotalObtained = 0;
    let grandTotalMax = 0;

    for (const examKey in annualResult.examResults) {
        const exam = annualResult.examResults[examKey as ExamType];
        if (exam && exam.subjects) {
            exam.subjects.forEach(sub => {
                grandTotalObtained += sub.obtainedMarks;
                grandTotalMax += sub.maxMarks;
            });
        }
    }

    if (grandTotalMax === 0) {
        return { percentage: 0, grade: 'N/A' };
    }

    const percentage = (grandTotalObtained / grandTotalMax) * 100;
    const grade = getGrade(percentage);

    return { percentage, grade };
};

export const calculateDuesForStudent = (student: Student, defaultStructure: { [key: string]: FeeStructure } | null) => {
    const previousDue = student.previousDue || 0;
    let currentSessionDue = 0;

    if (defaultStructure && student.className && student.fees?.[student.className]) {
        const studentFeeData = student.fees[student.className];
        const structure = studentFeeData.structure || defaultStructure[student.className];
        
        if (structure) {
            const annualFee = Object.values(structure).reduce((sum, head) => sum + (head.amount * head.months), 0);
            const concession = studentFeeData.concession || 0;
            const totalExpected = annualFee - concession;
            const totalPaid = (studentFeeData.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
            currentSessionDue = Math.max(0, totalExpected - totalPaid);
        }
    }
    
    const totalDue = currentSessionDue + previousDue;
    
    return { currentSessionDue, previousDue, totalDue };
};

export const calculateTotalDueForFamily = (students: Student[], defaultStructure: { [key: string]: FeeStructure }) => {
    let totalFamilyDue = 0;
    students.forEach(student => {
        const { totalDue } = calculateDuesForStudent(student, defaultStructure);
        totalFamilyDue += totalDue;
    });
    return totalFamilyDue;
};
