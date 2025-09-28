
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { AttendanceRecord } from '@/lib/types';
import { getTeacherAttendanceForMonth } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, addMonths, subMonths, isSunday } from 'date-fns';

interface TeacherAttendanceHistoryProps {
  teacherId: string;
}

export default function TeacherAttendanceHistory({ teacherId }: TeacherAttendanceHistoryProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!teacherId) {
        setAttendance([]);
        return;
    };

    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const records = await getTeacherAttendanceForMonth(
          teacherId,
          currentMonth.getFullYear(),
          currentMonth.getMonth()
        );
        setAttendance(records);
      } catch (error) {
        console.error("Failed to fetch teacher attendance", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [teacherId, currentMonth]);

  const { presentDays, absentDays, holidays } = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const result = { presentDays: [] as Date[], absentDays: [] as Date[], holidays: [] as Date[] };

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const record = attendance.find(a => a.date === dateStr);

        if (record) {
            if (record.status === 'Present') result.presentDays.push(date);
            else if (record.status === 'Absent') result.absentDays.push(date);
        } else if (isSunday(date)) {
            result.holidays.push(date);
        }
    }
    return result;
  }, [attendance, currentMonth]);
  
  const totalWorkingDays = getDaysInMonth(currentMonth) - holidays.length;
  const monthlyPercentage = totalWorkingDays > 0 ? (presentDays.length / totalWorkingDays) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>View My Attendance</CardTitle>
        <CardDescription>Review your monthly attendance report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></Button>
                <h3 className="text-xl font-semibold font-headline">{format(currentMonth, 'MMMM yyyy')}</h3>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></Button>
            </div>

            <Calendar
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{ 
                    present: presentDays, 
                    absent: absentDays, 
                    holiday: holidays
                }}
                modifiersClassNames={{
                    present: 'rdp-day_present',
                    absent: 'rdp-day_absent',
                    holiday: 'rdp-day_holiday'
                }}
                className="w-full"
            />
            <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-2">Monthly Summary</h4>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400"></span>Present: {presentDays.length} days</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400"></span>Absent: {absentDays.length} days</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300"></span>Holidays: {holidays.length} days</div>
                    </div>
                     <Badge>Current Month: {monthlyPercentage.toFixed(2)}%</Badge>
                </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
