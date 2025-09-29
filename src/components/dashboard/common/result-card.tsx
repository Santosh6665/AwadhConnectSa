
'use client';

import * as React from 'react';
import type { Student, AnnualResult, ExamResult, SubjectResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, User, BookOpen, BarChart, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { subjectsByClass } from './subjects-schema';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const getGrade = (percentage: number): { grade: string; remarks: string; passed: boolean } => {
  if (percentage >= 90) return { grade: 'A+', remarks: 'Outstanding', passed: true };
  if (percentage >= 80) return { grade: 'A', remarks: 'Excellent', passed: true };
  if (percentage >= 70) return { grade: 'B', remarks: 'Very Good', passed: true };
  if (percentage >= 60) return { grade: 'C', remarks: 'Good', passed: true };
  if (percentage >= 50) return { grade: 'D', remarks: 'Satisfactory', passed: true };
  if (percentage >= 33) return { grade: 'E', remarks: 'Needs Improvement', passed: true };
  return { grade: 'F', remarks: 'Fail', passed: false };
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-4 items-start py-1">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-semibold">{value || 'N/A'}</span>
    </div>
  );

type ResultCardProps = {
  student: Student;
  annualResult: AnnualResult;
  onDownload: () => void;
};

const ResultCard = React.forwardRef<HTMLDivElement, ResultCardProps>(
  ({ student, annualResult, onDownload }, ref) => {

    const qResult = annualResult.examResults.Quarterly;
    const hyResult = annualResult.examResults['Half-Yearly'];
    const anResult = annualResult.examResults.Annual;
    
    const subjects = subjectsByClass[student.className as keyof typeof subjectsByClass] || [];

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
    
    const overallPercentage = grandTotal.max > 0 ? (grandTotal.obtained / grandTotal.max) * 100 : 0;
    const { grade: overallGrade, passed: resultStatus } = getGrade(overallPercentage);

    const getSubjectMarks = (subjectName: string, examResult: ExamResult | undefined): SubjectResult | undefined => {
      return examResult?.subjects.find(s => s.subjectName === subjectName);
    }

    return (
      <div ref={ref}>
      <Card className="result-card p-4 sm:p-8 space-y-6 print:shadow-none print:border-none">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-4">
                  <GraduationCap className="h-12 w-12 text-primary" />
                  <div>
                      <h1 className="text-2xl font-bold font-headline">Awadh Inter College</h1>
                      <p className="text-sm text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-lg py-2 px-4">Annual Exam Result Card</Badge>
                  <Button
                      onClick={onDownload}
                      variant="outline"
                      size="icon"
                      className="no-print"
                  >
                      <Download className="h-5 w-5"/>
                  </Button>
              </div>
          </div>
          <Separator className="no-print"/>

          {/* Student Details */}
          <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-2"><User className="w-5 h-5 text-primary"/>Student Details</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <DetailItem label="Name:" value={`${student.firstName} ${student.lastName}`} />
                  <DetailItem label="Roll No.:" value={student.rollNo} />
                  <DetailItem label="Class/Section:" value={`${student.className}-${student.sectionName}`} />
                  <DetailItem label="Date of Birth:" value={student.dob} />
                  <DetailItem label="Father's Name:" value={student.parentName} />
                  <DetailItem label="Parent's Phone:" value={student.parentMobile} />
              </div>
          </div>

          {/* Academic Performance */}
          <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-2"><BookOpen className="w-5 h-5 text-primary"/>Academic Performance</h2>
              <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50">
                          <tr>
                              <th className="p-3 font-medium">Subject</th>
                              <th colSpan={2} className="p-3 font-medium text-center border-l">Quarterly</th>
                              <th colSpan={2} className="p-3 font-medium text-center border-l">Half-Yearly</th>
                              <th colSpan={2} className="p-3 font-medium text-center border-l">Annual</th>
                              <th colSpan={2} className="p-3 font-medium text-center border-l bg-muted">Total</th>
                          </tr>
                          <tr>
                              <th className="p-3"></th>
                              <th className="p-2 font-normal text-center w-20">Obtained</th>
                              <th className="p-2 font-normal text-center w-20 border-r">Max</th>
                              <th className="p-2 font-normal text-center w-20">Obtained</th>
                              <th className="p-2 font-normal text-center w-20 border-r">Max</th>
                              <th className="p-2 font-normal text-center w-20">Obtained</th>
                              <th className="p-2 font-normal text-center w-20 border-r">Max</th>
                              <th className="p-2 font-normal text-center w-20">Obtained</th>
                              <th className="p-2 font-normal text-center w-20">Max</th>
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
                                  <tr key={subject} className="border-t">
                                      <td className="p-3 font-medium">{subject}</td>
                                      <td className="p-2 text-center">{qSub?.obtainedMarks ?? '-'}</td>
                                      <td className="p-2 text-center text-muted-foreground border-r">{qSub?.maxMarks ?? '-'}</td>
                                      <td className="p-2 text-center">{hySub?.obtainedMarks ?? '-'}</td>
                                      <td className="p-2 text-center text-muted-foreground border-r">{hySub?.maxMarks ?? '-'}</td>
                                      <td className="p-2 text-center">{anSub?.obtainedMarks ?? '-'}</td>
                                      <td className="p-2 text-center text-muted-foreground border-r">{anSub?.maxMarks ?? '-'}</td>
                                      <td className="p-2 text-center font-semibold bg-muted/30">{totalSubObtained || '-'}</td>
                                      <td className="p-2 text-center font-semibold bg-muted/30 text-muted-foreground">{totalSubMax || '-'}</td>
                                  </tr>
                              );
                        })}
                          <tr className="border-t bg-muted font-semibold">
                              <td className="p-3">Grand Total</td>
                              <td className="p-2 text-center">{qTotal.obtained}</td>
                              <td className="p-2 text-center border-r">{qTotal.max}</td>
                              <td className="p-2 text-center">{hyTotal.obtained}</td>
                              <td className="p-2 text-center border-r">{hyTotal.max}</td>
                              <td className="p-2 text-center">{anTotal.obtained}</td>
                              <td className="p-2 text-center border-r">{anTotal.max}</td>
                              <td className="p-2 text-center">{grandTotal.obtained}</td>
                              <td className="p-2 text-center">{grandTotal.max}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Summary */}
          <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-2"><BarChart className="w-5 h-5 text-primary"/>Summary</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <DetailItem label="Percentage:" value={`${overallPercentage.toFixed(2)}%`} />
                  <DetailItem label="Overall Grade:" value={overallGrade} />
                  <DetailItem label="Class Rank:" value={annualResult.rank ? `${annualResult.rank}` : 'N/A'} />
                  <DetailItem label="Result Status:" value={<Badge variant={resultStatus ? 'default' : 'destructive'}>{resultStatus ? 'Pass' : 'Fail'}</Badge>} />
              </div>
          </div>

          {/* Signatures */}
          <div className="pt-24 print:pt-32">
              <h2 className="sr-only">Signatures</h2>
              <div className="flex justify-between items-center text-center">
                  <div className="w-48">
                      <Separator className="mb-2"/>
                      <p className="text-sm font-medium">Class Teacher</p>
                  </div>
                  <div className="w-48">
                      <Separator className="mb-2"/>
                      <p className="text-sm font-medium">Principal</p>
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
