
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Teacher, AttendanceRecord, SalaryPayment } from '@/lib/types';
import { getTeacherById, getTeacherAttendanceForMonth, getSalaryPaymentForTeacher } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, addMonths, subMonths, isSunday } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import SalarySlip from '@/components/dashboard/common/salary-slip';
import { Badge } from '@/components/ui/badge';

type SalaryDetails = {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  payableDays: number;
  perDaySalary: number;
  deduction: number;
  payableSalary: number;
};

export default function TeacherSalaryPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payment, setPayment] = useState<SalaryPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const slipRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => slipRef.current,
  });

  useEffect(() => {
    async function fetchTeacherData() {
      if (user?.id) {
        setIsLoading(true);
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        try {
          const teacherData = await getTeacherById(user.id);
          setTeacher(teacherData);

          if (teacherData) {
            const [attendanceRecords, paymentRecord] = await Promise.all([
               getTeacherAttendanceForMonth(teacherData.id, year, month),
               getSalaryPaymentForTeacher(teacherData.id, year, month)
            ]);
            setAttendance(attendanceRecords);
            setPayment(paymentRecord);
          }
        } catch (error) {
          console.error("Failed to fetch teacher data", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchTeacherData();
  }, [user, currentMonth]);

  const salaryDetails = useMemo((): SalaryDetails | null => {
    if (!teacher) return null;

    const totalDays = getDaysInMonth(currentMonth);
    const presentDays = attendance.filter(r => r.status === 'Present').length;
    const absentDays = attendance.filter(r => r.status === 'Absent').length;
    
    const payableDays = Math.min(31 - absentDays, 30);

    const baseSalary = teacher.salary || 0;
    const perDaySalary = baseSalary / 30; // Assuming salary is calculated for 30 days
    const deduction = (30 - payableDays) * perDaySalary;
    const payableSalary = baseSalary - Math.max(0, deduction);

    return { totalDays, presentDays, absentDays, payableDays, perDaySalary, deduction, payableSalary };
  }, [teacher, attendance, currentMonth]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!teacher || !salaryDetails) {
    return <p>Could not load salary details.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Salary Slip</h1>
        <p className="text-muted-foreground">View your monthly salary breakdown and download your slip.</p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Select Month</CardTitle>
                    <CardDescription>Choose the month for which you want to view your salary slip.</CardDescription>
                </div>
                <div>
                    <p className="text-sm">Status</p>
                    <Badge variant={payment?.status === 'Paid' ? 'default' : 'destructive'}>
                        {payment?.status || 'Pending'}
                    </Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></Button>
            <span className="text-lg font-semibold font-headline">{format(currentMonth, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></Button>
          </div>
        </CardContent>
      </Card>
      
      <SalarySlip
        ref={slipRef}
        teacher={teacher}
        month={currentMonth}
        salaryDetails={salaryDetails}
        onDownload={handlePrint}
      />
    </div>
  );
}
