
'use client';

import * as React from 'react';
import type { Student, AnnualResult, ExamResult, SubjectResult, ExamType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, BookOpen, BarChart, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { subjectsByClass } from './subjects-schema';
import { cn, calculateGrandTotalResult, getGrade as getGradeUtil } from '@/lib/utils';
import Image from 'next/image';

const getGradeWithRemarks = (percentage: number): { grade: string; remarks: string; passed: boolean } => {
  const grade = getGradeUtil(percentage);
  if (grade === 'F') return { grade, remarks: 'Fail', passed: false };
  if (percentage >= 90) return { grade: 'A+', remarks: 'Outstanding', passed: true };
  if (percentage >= 80) return { grade: 'A', remarks: 'Excellent', passed: true };
  if (percentage >= 70) return { grade: 'B', remarks: 'Very Good', passed: true };
  if (percentage >= 60) return { grade: 'C', remarks: 'Good', passed: true };
  if (percentage >= 50) return { grade: 'D', remarks: 'Satisfactory', passed: true };
  return { grade: 'E', remarks: 'Needs Improvement', passed: true };
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-2 items-start py-0.5">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <span className="font-semibold text-xs">{value || 'N/A'}</span>
    </div>
  );

type ResultCardProps = {
  student: Student;
  annualResult?: AnnualResult;
  forClass: string;
  onDownload: () => void;
  examType?: ExamType;
  rank?: number;
};

const ResultCard = React.forwardRef<HTMLDivElement, ResultCardProps>(
  ({ student, annualResult, forClass, onDownload, examType, rank }, ref) => {
    
    if (!annualResult) {
      return (
        <div ref={ref}>
          <Card className="p-8 text-center text-muted-foreground">
            No results found for the selected session.
          </Card>
        </div>
      );
    }

    const qResult = annualResult.examResults.Quarterly;
    const hyResult = annualResult.examResults['Half-Yearly'];
    const anResult = annualResult.examResults.Annual;
    
    const subjects = subjectsByClass[forClass as keyof typeof subjectsByClass] || [];

    const calculateTotal = (result: ExamResult | undefined) => {
      if (!result) return { obtained: 0, max: 0 };
      return result.subjects.reduce(
          (acc, sub) => ({
              obtained: acc.obtained + sub.obtainedMarks,
              max: acc.max + sub.maxMarks,
          }), { obtained: 0, max: 0 }
      );
    };
    
    const qTotal = calculateTotal(qResult);
    const hyTotal = calculateTotal(hyResult);
    const anTotal = calculateTotal(anResult);

    const grandTotal = {
        obtained: qTotal.obtained + hyTotal.obtained + anTotal.obtained,
        max: qTotal.max + hyTotal.max + anTotal.max,
    };
    
    const { percentage: overallPercentage, grade: overallGrade } = calculateGrandTotalResult(annualResult);
    const { passed: resultStatus } = getGradeWithRemarks(overallPercentage);

    const getSubjectMarks = (subjectName: string, examResult: ExamResult | undefined): SubjectResult | undefined => {
      return examResult?.subjects.find(s => s.subjectName === subjectName);
    }
    
    const sessionForClass = student.previousSessions?.find(s => s.className === forClass)?.session || student.session;
    const rollNoForClass = student.previousSessions?.find(s => s.className === forClass)?.rollNo || student.rollNo;
    const sectionForClass = student.previousSessions?.find(s => s.className === forClass)?.sectionName || student.sectionName;


    return (
      <div ref={ref}>
      <Card className="result-print-container result-card space-y-2 print:shadow-none print:border-none print:min-h-screen">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 p-3 sm:p-4">
              <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="School Logo" width={40} height={40} className="h-10 w-10" />
                  <div>
                      <h1 className="text-lg font-bold font-headline">Awadh Inter College</h1>
                      <p className="text-xs text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
                  </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Badge variant="secondary" className="text-xs py-1 px-3 whitespace-nowrap">Annual Result Card</Badge>
                  <Button
                      onClick={onDownload}
                      variant="outline"
                      size="icon"
                      className="no-print ml-auto"
                  >
                      <Download className="h-4 w-4"/>
                  </Button>
              </div>
          </div>
          <Separator className="no-print"/>

          {/* Student Details */}
          <div className="px-3 sm:px-4">
              <h2 className="flex items-center gap-2 text-base font-semibold mb-1"><User className="w-4 h-4 text-primary"/>Student Details</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                  <DetailItem label="Name:" value={`${student.firstName} ${student.lastName}`} />
                  <DetailItem label="Roll No.:" value={rollNoForClass} />
                  <DetailItem label="Class/Section:" value={`${forClass}-${sectionForClass}`} />
                  <DetailItem label="Session:" value={sessionForClass} />
                  <DetailItem label="Father's Name:" value={student.parentName} />
                  <DetailItem label="Parent's Phone:" value={student.parentMobile} />
              </div>
          </div>

          {/* Academic Performance */}
          <div className="px-3 sm:px-4">
              <h2 className="flex items-center gap-2 text-base font-semibold mb-1"><BookOpen className="w-4 h-4 text-primary"/>Academic Performance</h2>
                <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50">
                            <tr className="whitespace-nowrap">
                                <th className="p-2 font-medium">Subject</th>
                                <th colSpan={2} className="p-2 font-medium text-center border-l">Quarterly</th>
                                <th colSpan={2} className="p-2 font-medium text-center border-l">Half-Yearly</th>
                                <th colSpan={2} className="p-2 font-medium text-center border-l">Annual</th>
                                <th colSpan={2} className="p-2 font-medium text-center border-l bg-muted">Total</th>
                            </tr>
                            <tr>
                                <th className="p-1 w-[120px] sm:w-auto"></th>
                                <th className="p-1 font-normal text-center w-16">Obt.</th>
                                <th className="p-1 font-normal text-center w-16 border-r">Max</th>
                                <th className="p-1 font-normal text-center w-16">Obt.</th>
                                <th className="p-1 font-normal text-center w-16 border-r">Max</th>
                                <th className="p-1 font-normal text-center w-16">Obt.</th>
                                <th className="p-1 font-normal text-center w-16 border-r">Max</th>
                                <th className="p-1 font-normal text-center w-16">Obt.</th>
                                <th className="p-1 font-normal text-center w-16">Max</th>
                            </tr>
                        </thead>
                        <tbody>
                          {subjects.map(subject => {
                                const qSub = getSubjectMarks(subject, qResult);
                                const hySub = getSubjectMarks(subject, hyResult);
                                const anSub = getSubjectMarks(subject, anResult);
                                const totalSubObtained = (qSub?.obtainedMarks || 0) + (hySub?.obtainedMarks || 0) + (anSub?.obtainedMarks || 0);
                                const totalSubMax = (qSub?.maxMarks || 0) + (hySub?.maxMarks || 0) + (anSub?.maxMarks || 0);
                            
                                return (
                                    <tr key={subject} className="border-t whitespace-nowrap">
                                        <td className="p-2 font-medium">{subject}</td>
                                        <td className="p-1 text-center">{qSub?.obtainedMarks ?? '-'}</td>
                                        <td className="p-1 text-center text-muted-foreground border-r">{qSub?.maxMarks ?? '-'}</td>
                                        <td className="p-1 text-center">{hySub?.obtainedMarks ?? '-'}</td>
                                        <td className="p-1 text-center text-muted-foreground border-r">{hySub?.maxMarks ?? '-'}</td>
                                        <td className="p-1 text-center">{anSub?.obtainedMarks ?? '-'}</td>
                                        <td className="p-1 text-center text-muted-foreground border-r">{anSub?.maxMarks ?? '-'}</td>
                                        <td className="p-1 text-center font-semibold bg-muted/30">{totalSubObtained || '-'}</td>
                                        <td className="p-1 text-center font-semibold bg-muted/30 text-muted-foreground">{totalSubMax || '-'}</td>
                                    </tr>
                                );
                          })}
                            <tr className="border-t bg-muted font-semibold whitespace-nowrap">
                                <td className="p-2">Grand Total</td>
                                <td className="p-1 text-center">{qTotal.obtained}</td>
                                <td className="p-1 text-center border-r">{qTotal.max}</td>
                                <td className="p-1 text-center">{hyTotal.obtained}</td>
                                <td className="p-1 text-center border-r">{hyTotal.max}</td>
                                <td className="p-1 text-center">{anTotal.obtained}</td>
                                <td className="p-1 text-center border-r">{anTotal.max}</td>
                                <td className="p-1 text-center">{grandTotal.obtained}</td>
                                <td className="p-1 text-center">{grandTotal.max}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
          </div>

          {/* Summary */}
          <div className="px-3 sm:px-4">
              <h2 className="flex items-center gap-2 text-base font-semibold mb-1"><BarChart className="w-4 h-4 text-primary"/>Overall Summary</h2>
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <DetailItem label="Overall Percentage:" value={`${overallPercentage.toFixed(2)}%`} />
                  <DetailItem label="Overall Grade:" value={overallGrade} />
                   <DetailItem label="Class Rank:" value={rank ? `${rank}` : 'N/A'} />
                  <DetailItem label="Result Status:" value={<Badge variant={resultStatus ? 'default' : 'destructive'}>{resultStatus ? 'Pass' : 'Fail'}</Badge>} />
              </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 px-3 sm:px-4 pb-3">
              <h2 className="sr-only">Signatures</h2>
              <div className="flex justify-between items-center text-center">
                  <div className="w-48">
                      <Separator className="mb-2"/>
                      <p className="text-xs font-medium">Class Teacher</p>
                  </div>
                  <div className="w-48">
                      <Separator className="mb-2"/>
                      <p className="text-xs font-medium">Principal</p>
                  </div>
              </div>
          </div>
      </Card>
      </div>
    );
  }
);
ResultCard.displayName = 'ResultCard';


export default ResultCard;
