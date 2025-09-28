
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AnnualResult } from "./types";

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

export const calculateOverallResult = (annualResult?: AnnualResult): { percentage: number; grade: string } => {
    if (!annualResult) return { percentage: 0, grade: 'N/A' };
    
    let totalObtained = 0;
    let totalMax = 0;
    
    const examResults = Object.values(annualResult.examResults || {});
    
    // Use the last available exam for calculation if multiple are present
    const lastExam = examResults[examResults.length - 1];

    if(lastExam && lastExam.subjects) {
        lastExam.subjects.forEach(sub => {
            totalObtained += sub.obtainedMarks;
            totalMax += sub.maxMarks;
        });
    }

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const grade = getGrade(percentage);

    return { percentage, grade };
};
