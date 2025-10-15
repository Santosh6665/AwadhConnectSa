
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getParentByMobile, getStudentByAdmissionNumber, getAttendanceForMonth, getFeeStructure } from '@/lib/firebase/firestore';
import type { Parent, Student, ExamType, FeeStructure } from '@/lib/types';
import { Loader2, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ChildProfileCard from '@/components/parent/child-profile-card';
import { calculateOverallResult, calculateTotalDueForFamily } from '@/lib/utils';
import { format, getDaysInMonth, isSunday } from 'date-fns';
import FamilyDueCard from '@/components/parent/family-due-card';

export type ProcessedChild = Student & {
  feeStatus: 'Paid' | 'Due' | 'Partial';
  monthlyAttendance: number;
  recentExamScore: number;
};

export default function ParentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [parent, setParent] = useState<Parent | null>(null);
  const [processedChildren, setProcessedChildren] = useState<ProcessedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDue, setTotalDue] = useState(0);
  const [feeStructure, setFeeStructure] = useState<{[key: string]: FeeStructure} | null>(null);

  useEffect(() => {
    if (user && user.id) {
      const fetchParentData = async () => {
        setLoading(true);
        try {
            const parentData = await getParentByMobile(user.id!);
            setParent(parentData);

            const feeStructureData = await getFeeStructure();
            setFeeStructure(feeStructureData);

            if (!parentData?.children || parentData.children.length === 0) {
                setProcessedChildren([]);
                setLoading(false);
                return;
            }

            const studentPromises = parentData.children.map(getStudentByAdmissionNumber);
            const studentResults = await Promise.all(studentPromises);
            const validStudents = studentResults.filter((s): s is Student => s !== null);

            if (feeStructureData) {
                const due = calculateTotalDueForFamily(validStudents, feeStructureData);
                setTotalDue(due);
            }

            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const attendancePromises = validStudents.map(student => 
                getAttendanceForMonth(student.admissionNumber, year, month)
            );
            const allAttendanceRecords = await Promise.all(attendancePromises);

            const processed = validStudents.map((student, index) => {
                const attendanceRecordsForStudent = allAttendanceRecords[index];

                // 1. Robust Fee Status Calculation
                let feeStatus: 'Paid' | 'Due' | 'Partial' = 'Due';
                const feeData = student.fees?.[student.session];
                if (feeData) {
                    const structure = feeData.structure;
                    const totalPayable = (structure
                        ? Object.values(structure).reduce((sum, head) => sum + (head.amount * head.months), 0)
                        : feeData.totalFees || 0) - (feeData.concession || 0);

                    const totalPaid = (feeData.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);

                    if (totalPayable <= 0 || totalPaid >= totalPayable) {
                        feeStatus = 'Paid';
                    } else if (totalPaid > 0) {
                        feeStatus = 'Partial';
                    } else {
                        feeStatus = 'Due';
                    }
                }

                // 2. Definitive, Consistent Monthly Attendance Calculation
                const daysInMonth = getDaysInMonth(today);
                let presentDaysCount = 0;
                let holidaysCount = 0;

                const attendanceMap = new Map(attendanceRecordsForStudent.map(r => [r.date, r.status]));

                for (let i = 1; i <= daysInMonth; i++) {
                    const date = new Date(year, month, i);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    
                    if (attendanceMap.has(dateStr)) {
                        if (String(attendanceMap.get(dateStr)).toLowerCase() === 'present') {
                            presentDaysCount++;
                        }
                    } else {
                        if (isSunday(date)) {
                            holidaysCount++;
                        }
                    }
                }

                const totalWorkingDays = daysInMonth - holidaysCount;
                let monthlyAttendance = 0;
                if (totalWorkingDays > 0) {
                    monthlyAttendance = (presentDaysCount / totalWorkingDays) * 100;
                }

                // 3. Calculate Recent Exam Score
                let recentExamScore = 0;
                const annualResult = student.results?.[student.className];
                if (annualResult) {
                    const examOrder: ExamType[] = ['Annual', 'Half-Yearly', 'Quarterly'];
                    let latestExam: ExamType | null = null;
                    for (const exam of examOrder) {
                        if (annualResult.examResults?.[exam]) {
                            latestExam = exam;
                            break;
                        }
                    }
                    if (latestExam) {
                        const { percentage } = calculateOverallResult(annualResult, latestExam);
                        recentExamScore = percentage;
                    }
                }
                
                return {
                  ...student,
                  feeStatus,
                  monthlyAttendance,
                  recentExamScore,
                };
            });

            setProcessedChildren(processed);
        } catch (error) {
            console.error("Failed to fetch parent dashboard data:", error);
        } finally {
            setLoading(false);
        }
      };
      fetchParentData();
    }
  }, [user, user?.id]);

  if (authLoading || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!parent) {
    return <div>Could not load parent data.</div>;
  }

  return (
    <div className="space-y-0">
      <div>
        <h1 className="text-3xl font-headline font-bold">Parent Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {parent.name}!</p>
      </div>
      
      <FamilyDueCard totalDue={totalDue} />

      <Card className='m-0 p-0'>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg"><Users className="w-6 h-6 text-primary" /></div>
            <div>
              <CardTitle>My Children</CardTitle>
              <CardDescription>An overview of your children's profiles.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0 m-0'>
          <div className="space-y-0">
            {processedChildren.length > 0 ? (
              processedChildren.map(child => <ChildProfileCard key={child.admissionNumber} student={child} />)
            ) : (
              <p className="text-muted-foreground text-center py-8">No children found linked to this account.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
