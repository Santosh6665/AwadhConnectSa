
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Teacher, AttendanceRecord } from '@/lib/types';
import { getTeachers, getTeacherAttendanceForMonth } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, getDaysInMonth, addMonths, subMonths, isSunday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import SalarySlip from '@/components/dashboard/common/salary-slip';

type SalaryDetails = {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  payableDays: number;
  perDaySalary: number;
  deduction: number;
  payableSalary: number;
};

export default function AdminSalaryPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<Map<string, AttendanceRecord[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => slipRef.current,
  });

  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      try {
        const activeTeachers = await getTeachers({ status: 'Active' });
        setTeachers(activeTeachers);

        const attendancePromises = activeTeachers.map(teacher =>
          getTeacherAttendanceForMonth(teacher.id, currentMonth.getFullYear(), currentMonth.getMonth())
        );
        const attendanceResults = await Promise.all(attendancePromises);

        const attendanceMap = new Map<string, AttendanceRecord[]>();
        activeTeachers.forEach((teacher, index) => {
          attendanceMap.set(teacher.id, attendanceResults[index]);
        });
        setTeacherAttendance(attendanceMap);

      } catch (error) {
        console.error("Failed to fetch teacher or attendance data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllData();
  }, [currentMonth]);

  const calculateSalary = (teacher: Teacher, attendance: AttendanceRecord[] = []): SalaryDetails => {
    const totalDays = getDaysInMonth(currentMonth);
    const sundays = Array.from({ length: totalDays }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)).filter(isSunday).length;

    const presentDays = attendance.filter(r => r.status === 'Present').length;
    const absentDays = attendance.filter(r => r.status === 'Absent').length;
    
    const allowedAbsent = 1;
    const daysToDeduct = Math.max(0, absentDays - allowedAbsent);
    const payableDays = totalDays - sundays - daysToDeduct;

    const baseSalary = teacher.salary || 0;
    const perDaySalary = baseSalary / (totalDays - sundays);
    const deduction = daysToDeduct * perDaySalary;
    const payableSalary = baseSalary - deduction;

    return { totalDays, presentDays, absentDays, payableDays, perDaySalary, deduction, payableSalary };
  };

  const salaryData = useMemo(() => {
    return teachers.map(teacher => {
      const attendance = teacherAttendance.get(teacher.id) || [];
      const salaryDetails = calculateSalary(teacher, attendance);
      return { teacher, salaryDetails };
    });
  }, [teachers, teacherAttendance, currentMonth]);

  const handleViewSlip = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsSlipOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Manage Teacher Salaries</h1>
        <p className="text-muted-foreground">Generate and view monthly salaries based on attendance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Month</CardTitle>
          <CardDescription>Choose the month for which you want to view salaries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></Button>
            <span className="text-lg font-semibold font-headline">{format(currentMonth, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Salary Overview</CardTitle>
            <CardDescription>Monthly salary summary for all active teachers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Payable Salary</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryData.map(({ teacher, salaryDetails }) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.id}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>₹{teacher.salary?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>{salaryDetails.presentDays}</TableCell>
                      <TableCell>{salaryDetails.absentDays}</TableCell>
                      <TableCell className="font-semibold">₹{salaryDetails.payableSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleViewSlip(teacher)}>Generate Slip</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTeacher && (
        <Dialog open={isSlipOpen} onOpenChange={setIsSlipOpen}>
            <DialogContent className="max-w-4xl p-0 border-0">
                <SalarySlip
                    ref={slipRef}
                    teacher={selectedTeacher}
                    month={currentMonth}
                    salaryDetails={calculateSalary(selectedTeacher, teacherAttendance.get(selectedTeacher.id))}
                    onDownload={handlePrint}
                />
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
