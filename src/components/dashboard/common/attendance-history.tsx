
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { UserRole, Student, Teacher, Parent, AttendanceRecord, AttendanceStatus } from '@/lib/types';
import { getStudents, getTeacherById, getParentByMobile, getAttendanceForMonth } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format, getDaysInMonth } from 'date-fns';

interface AttendanceHistoryProps {
  role: UserRole;
  studentId?: string;
  parentId?: string;
  teacherId?: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(currentYear, i), 'MMMM') }));
const classOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];

export default function AttendanceHistory({ role, studentId, parentId, teacherId }: AttendanceHistoryProps) {
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());

  // Admin/Teacher filters
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Parent state
  const [children, setChildren] = useState<Student[]>([]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Set initial student for non-admin/teacher roles
  useEffect(() => {
    if (role === 'student' && studentId) {
      setSelectedStudentId(studentId);
    }
  }, [role, studentId]);

  // Fetch data for filters (Admin/Teacher)
  useEffect(() => {
    async function fetchDataForFilters() {
      if (role === 'admin') {
        const students = await getStudents({ status: 'Active' });
        setAllStudents(students);
      } else if (role === 'teacher' && teacherId) {
        const teacher = await getTeacherById(teacherId);
        if (teacher && teacher.classes) {
          const studentPromises = teacher.classes.map(classStr => {
             const match = classStr.match(/(\d+|[A-Z]+)([A-Z])$/i);
              let className, sectionName;
              
              if (classStr.length <= 3 && !/\d/.test(classStr.slice(0,-1))) { // LKG, UKG, Nursery
                  className = classStr.slice(0, -1);
                  sectionName = classStr.slice(-1);
              } else {
                  const classPartMatch = classStr.match(/^(\d+|[a-zA-Z]+)/);
                  className = classPartMatch ? classPartMatch[0] : '';
                  sectionName = classStr.replace(className, '');
              }
            return getStudents({ className, sectionName, status: 'Active' });
          });
          const studentsByClass = await Promise.all(studentPromises);
          const allTeacherStudents = studentsByClass.flat();
          setAllStudents(allTeacherStudents);
        }
      }
    }
    fetchDataForFilters();
  }, [role, teacherId]);

  // Fetch children for parent
  useEffect(() => {
    async function fetchChildren() {
        if (role === 'parent' && parentId) {
            const parent = await getParentByMobile(parentId);
            if (parent && parent.children) {
                const studentPromises = parent.children.map(id => getStudents({ admissionNumber: id }));
                const studentsArrays = await Promise.all(studentPromises);
                const parentChildren = studentsArrays.flat().filter(s => s.status === 'Active');
                setChildren(parentChildren);
                if (parentChildren.length > 0) {
                    setSelectedStudentId(parentChildren[0].admissionNumber);
                }
            }
        }
    }
    fetchChildren();
  }, [role, parentId]);


  // Filter students for dropdown when class/section changes
  useEffect(() => {
    if (role === 'admin' || role === 'teacher') {
      let studentsToList = allStudents;
      if (selectedClass) {
        studentsToList = studentsToList.filter(s => s.className === selectedClass);
      }
      if (selectedSection) {
        studentsToList = studentsToList.filter(s => s.sectionName === selectedSection);
      }
      setFilteredStudents(studentsToList);
      if (studentsToList.length > 0) {
          setSelectedStudentId(studentsToList[0].admissionNumber);
      } else {
          setSelectedStudentId('');
      }
    }
  }, [selectedClass, selectedSection, allStudents, role]);
  
  // Fetch attendance data
  useEffect(() => {
    if (!selectedStudentId || !selectedYear || selectedMonth === undefined) return;

    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const records = await getAttendanceForMonth(
          selectedStudentId,
          parseInt(selectedYear),
          parseInt(selectedMonth)
        );
        setAttendance(records);
      } catch (error) {
        console.error("Failed to fetch attendance", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedStudentId, selectedYear, selectedMonth]);

  const monthlyReport = useMemo(() => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = getDaysInMonth(new Date(year, month));
    
    const report = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dateStr = format(date, 'yyyy-MM-dd');
      const record = attendance.find(a => a.date === dateStr);
      return {
        date: format(date, 'dd MMM yyyy'),
        day: format(date, 'EEEE'),
        status: record ? record.status : ('Sunday' === format(date, 'EEEE') ? 'Holiday' : 'N/A'),
      };
    });

    const summary = {
      Present: report.filter(r => r.status === 'Present').length,
      Absent: report.filter(r => r.status === 'Absent').length,
      Leave: report.filter(r => r.status === 'Leave').length,
    };

    return { report, summary };
  }, [attendance, selectedYear, selectedMonth]);

  const getStatusVariant = (status: AttendanceStatus | 'N/A' | 'Holiday'): 'default' | 'destructive' | 'secondary' => {
      switch(status) {
          case 'Present': return 'default';
          case 'Absent': return 'destructive';
          default: return 'secondary';
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Attendance</CardTitle>
        <CardDescription>Select filters to view the monthly attendance report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter Section */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}</SelectContent>
          </Select>

          {role === 'admin' && (
            <>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All Classes" /></SelectTrigger>
                <SelectContent>{classOptions.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All Sections" /></SelectTrigger>
                <SelectContent>{sectionOptions.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent>
              </Select>
            </>
          )}

          {(role === 'admin' || role === 'teacher') && (
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={filteredStudents.length === 0}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select Student" /></SelectTrigger>
                <SelectContent>
                    {filteredStudents.map(s => <SelectItem key={s.admissionNumber} value={s.admissionNumber}>{s.firstName} {s.lastName} ({s.rollNo})</SelectItem>)}
                </SelectContent>
            </Select>
          )}

          {role === 'parent' && (
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={children.length === 0}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select Child" /></SelectTrigger>
                <SelectContent>
                    {children.map(c => <SelectItem key={c.admissionNumber} value={c.admissionNumber}>{c.firstName} {c.lastName}</SelectItem>)}
                </SelectContent>
            </Select>
          )}
        </div>

        {/* Report Section */}
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : selectedStudentId ? (
          <div>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {monthlyReport.report.map(day => (
                            <TableRow key={day.date}>
                                <TableCell>{day.date}</TableCell>
                                <TableCell>{day.day}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(day.status as any)}>{day.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="mt-4 flex justify-end gap-4 font-semibold text-sm pr-4">
                <span>Total Present: <span className="text-green-600">{monthlyReport.summary.Present}</span></span>
                <span>Total Absent: <span className="text-red-600">{monthlyReport.summary.Absent}</span></span>
                <span>Total Leave: <span className="text-yellow-600">{monthlyReport.summary.Leave}</span></span>
            </div>
          </div>
        ) : (
            <div className="text-center py-16 text-muted-foreground">
                Please select a student to view their attendance history.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
