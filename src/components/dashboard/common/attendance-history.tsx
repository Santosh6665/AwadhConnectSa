
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { UserRole, Student, Teacher, Parent, AttendanceRecord } from '@/lib/types';
import { getStudents, getTeacherById, getParentByMobile, getAttendanceForMonth } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, addMonths, subMonths, isSunday } from 'date-fns';

interface AttendanceHistoryProps {
  role: UserRole;
  studentId?: string;
  parentId?: string;
  teacherId?: string;
}

const classOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];

export default function AttendanceHistory({ role, studentId, parentId, teacherId }: AttendanceHistoryProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Admin/Teacher filters
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Teacher-specific state
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  // Parent state
  const [children, setChildren] = useState<Student[]>([]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    async function getStudent() {
      if (studentId) {
         const student = await getStudentByAdmissionNumber(studentId);
         setSelectedStudent(student);
         if (student) {
           setSelectedClass(student.className);
           setSelectedSection(student.sectionName);
         }
      }
    }
    getStudent();
  }, [studentId]);

  useEffect(() => {
    async function fetchDataForFilters() {
      if (role === 'admin') {
        const students = await getStudents({ status: 'Active' });
        setAllStudents(students);
      } else if (role === 'teacher' && teacherId) {
        const teacherData = await getTeacherById(teacherId);
        setTeacher(teacherData);
        if (teacherData && teacherData.classes) {
          const studentPromises = teacherData.classes.map(classStr => {
              const classPartMatch = classStr.match(/^(\d+|[a-zA-Z]+)/);
              const className = classPartMatch ? classPartMatch[0] : '';
              const sectionName = classStr.replace(className, '');
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

  useEffect(() => {
    async function fetchChildren() {
        if (role === 'parent' && parentId) {
            const parent = await getParentByMobile(parentId);
            if (parent && parent.children) {
                const studentPromises = parent.children.map(id => getStudentByAdmissionNumber(id));
                const studentResults = await Promise.all(studentPromises);
                const parentChildren = studentResults.filter((s): s is Student => s !== null && s.status === 'Active');
                setChildren(parentChildren);
                if (parentChildren.length > 0 && !studentId) {
                    setSelectedStudent(parentChildren[0]);
                }
            }
        }
    }
    fetchChildren();
  }, [role, parentId, studentId]);


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

      if (!studentId && studentsToList.length > 0) {
          setSelectedStudent(studentsToList[0]);
      } else if (!studentId) {
          setSelectedStudent(null);
      }
    }
  }, [selectedClass, selectedSection, allStudents, role, studentId]);
  
  useEffect(() => {
    if (!selectedStudent?.admissionNumber) {
        setAttendance([]);
        return;
    };

    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const records = await getAttendanceForMonth(
          selectedStudent.admissionNumber,
          currentMonth.getFullYear(),
          currentMonth.getMonth()
        );
        setAttendance(records);
      } catch (error) {
        console.error("Failed to fetch attendance", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedStudent, currentMonth]);

  const { presentDays, absentDays, leaveDays, holidays } = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const result = { presentDays: [] as Date[], absentDays: [] as Date[], leaveDays: [] as Date[], holidays: [] as Date[] };

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const record = attendance.find(a => a.date === dateStr);

        if (record) {
            if (record.status === 'Present') result.presentDays.push(date);
            else if (record.status === 'Absent') result.absentDays.push(date);
            else if (record.status === 'Leave') result.leaveDays.push(date);
        } else if (isSunday(date)) {
            result.holidays.push(date);
        }
    }
    return result;
  }, [attendance, currentMonth]);
  
  const totalWorkingDays = getDaysInMonth(currentMonth) - holidays.length;
  const monthlyPercentage = totalWorkingDays > 0 ? (presentDays.length / totalWorkingDays) * 100 : 0;


  const handleStudentChange = (admissionNumber: string) => {
    const student = allStudents.find(s => s.admissionNumber === admissionNumber) || children.find(c => c.admissionNumber === admissionNumber);
    setSelectedStudent(student || null);
  }
  
  const parseClassSection = (classSection: string) => {
        if (!classSection) return ['', ''];
        const classPartMatch = classSection.match(/^(\d+|[a-zA-Z]+)/);
        const className = classPartMatch ? classPartMatch[0] : '';
        const sectionName = classSection.replace(className, '');
        return [className, sectionName];
  };
  
  const handleClassChange = (classSection: string) => {
      const [className, sectionName] = parseClassSection(classSection);
      setSelectedClass(className);
      setSelectedSection(sectionName);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Attendance</CardTitle>
        <CardDescription>Select filters to view the monthly attendance report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
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

          {role === 'teacher' && teacher?.classes && (
             <Select onValueChange={handleClassChange}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All My Classes" /></SelectTrigger>
                <SelectContent>{teacher.classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
          )}

          {(role === 'admin' || role === 'teacher') && (
            <Select value={selectedStudent?.admissionNumber || ''} onValueChange={handleStudentChange} disabled={filteredStudents.length === 0}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select Student" /></SelectTrigger>
                <SelectContent>
                    {filteredStudents.map(s => <SelectItem key={s.admissionNumber} value={s.admissionNumber}>{s.firstName} {s.lastName} ({s.rollNo})</SelectItem>)}
                </SelectContent>
            </Select>
          )}

          {role === 'parent' && (
            <Select value={selectedStudent?.admissionNumber || ''} onValueChange={handleStudentChange} disabled={children.length === 0}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select Child" /></SelectTrigger>
                <SelectContent>
                    {children.map(c => <SelectItem key={c.admissionNumber} value={c.admissionNumber}>{c.firstName} {c.lastName}</SelectItem>)}
                </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : selectedStudent ? (
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
                    leave: leaveDays,
                    holiday: holidays
                }}
                modifiersClassNames={{
                    present: 'rdp-day_present',
                    absent: 'rdp-day_absent',
                    leave: 'rdp-day_leave',
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
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span>Leave: {leaveDays.length} days</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300"></span>Holidays: {holidays.length} days</div>
                    </div>
                     <Badge>Current Month: {monthlyPercentage.toFixed(2)}%</Badge>
                </div>
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

    