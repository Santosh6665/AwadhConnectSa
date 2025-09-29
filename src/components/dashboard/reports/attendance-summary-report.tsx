'use client';
import type { Student, DailyAttendance } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '../stat-card';
import { UserCheck, UserX, CalendarDays, BarChart } from 'lucide-react';

export default function AttendanceSummaryReport({ students, allAttendance }: { students: Student[], allAttendance: DailyAttendance[] }) {
  const totalStudents = students.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todaysAttendance = allAttendance.find(att => att.date === today);

  const presentToday = todaysAttendance?.records.filter(r => r.status === 'Present').length || 0;
  const absentToday = todaysAttendance?.records.filter(r => r.status === 'Absent').length || 0;

  const totalPossibleAttendances = allAttendance.reduce((acc, att) => acc + att.records.length, 0);
  const totalPresents = allAttendance.reduce((acc, att) => acc + att.records.filter(r => r.status === 'Present').length, 0);
  
  const overallAttendancePercentage = totalPossibleAttendances > 0 ? (totalPresents / totalPossibleAttendances) * 100 : 0;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Summary</CardTitle>
        <CardDescription>A quick look at today's and overall attendance metrics.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Present Today" value={presentToday.toString()} icon={UserCheck} description={today} />
        <StatCard title="Absent Today" value={absentToday.toString()} icon={UserX} description={today} />
        <StatCard title="Total Students" value={totalStudents.toString()} icon={CalendarDays} description="Active enrollment"/>
        <StatCard title="Overall Attendance" value={`${overallAttendancePercentage.toFixed(2)}%`} icon={BarChart} description="All-time average"/>
      </CardContent>
    </Card>
  );
}
