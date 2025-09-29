
'use client';

import { useState, useEffect, useMemo, useRef, useTransition } from 'react';
import type { Teacher, AttendanceRecord, SalaryPayment } from '@/lib/types';
import { getTeachers, getTeacherAttendanceForMonth, getSalaryPaymentsForMonth } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ChevronLeft, ChevronRight, Download, Edit } from 'lucide-react';
import { format, getDaysInMonth, addMonths, subMonths, isSunday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import SalarySlip from '@/components/dashboard/common/salary-slip';
import ManagePaymentDialog from '@/components/dashboard/admin/salary/manage-payment-dialog';
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

export default function AdminSalaryPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<Map<string, AttendanceRecord[]>>(new Map());
  const [salaryPayments, setSalaryPayments] = useState<Map<string, SalaryPayment>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      try {
        const activeTeachers = await getTeachers({ status: 'Active' });
        setTeachers(activeTeachers);

        const attendancePromises = activeTeachers.map(teacher =>
          getTeacherAttendanceForMonth(teacher.id, year, month)
        );
        
        const [attendanceResults, paymentResults] = await Promise.all([
           Promise.all(attendancePromises),
           getSalaryPaymentsForMonth(year, month)
        ]);

        const attendanceMap = new Map<string, AttendanceRecord[]>();
        activeTeachers.forEach((teacher, index) => {
          attendanceMap.set(teacher.id, attendanceResults[index]);
        });
        setTeacherAttendance(attendanceMap);

        const paymentMap = new Map<string, SalaryPayment>();
        paymentResults.forEach(payment => {
            paymentMap.set(payment.teacherId, payment);
        });
        setSalaryPayments(paymentMap);

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
    const presentDays = attendance.filter(r => r.status === 'Present').length;
    const absentDays = attendance.filter(r => r.status === 'Absent').length;
    
    const payableDays = Math.min(31 - absentDays, 30);

    const baseSalary = teacher.salary || 0;
    const perDaySalary = baseSalary / 30; // Assuming salary is calculated for 30 days
    const deduction = (30 - payableDays) * perDaySalary;
    const payableSalary = baseSalary - Math.max(0, deduction);

    return { totalDays, presentDays, absentDays, payableDays, perDaySalary, deduction, payableSalary };
  };

  const salaryData = useMemo(() => {
    return teachers.map(teacher => {
      const attendance = teacherAttendance.get(teacher.id) || [];
      const salaryDetails = calculateSalary(teacher, attendance);
      const payment = salaryPayments.get(teacher.id);
      return { teacher, salaryDetails, payment };
    });
  }, [teachers, teacherAttendance, salaryPayments, currentMonth]);

  const handleViewSlip = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsSlipOpen(true);
  }
  
  const handleManagePayment = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsManageOpen(true);
  }
  
  const handlePaymentSaved = (payment: SalaryPayment) => {
    setSalaryPayments(prev => new Map(prev).set(payment.teacherId, payment));
    setIsManageOpen(false);
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
                    <TableHead>Payable Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryData.map(({ teacher, salaryDetails, payment }) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.id}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>₹{teacher.salary?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">₹{salaryDetails.payableSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                       <TableCell>
                         <Badge variant={payment?.status === 'Paid' ? 'default' : 'destructive'}>
                           {payment?.status || 'Pending'}
                         </Badge>
                       </TableCell>
                      <TableCell>
                         <div className="flex gap-2">
                           <Button variant="outline" size="sm" onClick={() => handleViewSlip(teacher)}>
                              <Download className="mr-2 h-4 w-4" />
                              Slip
                           </Button>
                           <Button variant="secondary" size="sm" onClick={() => handleManagePayment(teacher)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Manage
                           </Button>
                         </div>
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
        <>
            <Dialog open={isSlipOpen} onOpenChange={setIsSlipOpen}>
                <DialogContent className="max-w-4xl p-0 border-0">
                    <SalarySlip
                        teacher={selectedTeacher}
                        month={currentMonth}
                        salaryDetails={calculateSalary(selectedTeacher, teacherAttendance.get(selectedTeacher.id))}
                    />
                </DialogContent>
            </Dialog>
            <ManagePaymentDialog
                isOpen={isManageOpen}
                onOpenChange={setIsManageOpen}
                teacher={selectedTeacher}
                month={currentMonth}
                payableAmount={calculateSalary(selectedTeacher, teacherAttendance.get(selectedTeacher.id)).payableSalary}
                existingPayment={salaryPayments.get(selectedTeacher.id) || null}
                onSave={handlePaymentSaved}
            />
        </>
      )}
    </div>
  );
}
