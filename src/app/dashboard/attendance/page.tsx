
'use client';
import { useState, useEffect, useTransition } from 'react';
import { getStudents, getAttendance } from '@/lib/firebase/firestore';
import type { Student, DailyAttendance, AttendanceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

const classOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];

const AttendanceSummary = ({ attendance }: { attendance: DailyAttendance | null }) => {
    if (!attendance) return null;

    const total = attendance.records.length;
    const present = attendance.records.filter(r => r.status === 'Present').length;
    const absent = attendance.records.filter(r => r.status === 'Absent').length;
    const leave = attendance.records.filter(r => r.status === 'Leave').length;

    const toPercent = (val: number) => total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
                <CardDescription>
                    For {format(new Date(attendance.date), 'PPP')} | Class: {attendance.className}-{attendance.sectionName}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold">{toPercent(present)}%</p>
                    <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{toPercent(absent)}%</p>
                    <p className="text-sm text-muted-foreground">Absent</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{toPercent(leave)}%</p>
                    <p className="text-sm text-muted-foreground">On Leave</p>
                </div>
            </CardContent>
        </Card>
    );
};


export default function AdminAttendancePage() {
    const { user } = useAuth();
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<DailyAttendance | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, startTransition] = useTransition();

    const { toast } = useToast();

    const handleFetchAttendance = async () => {
        if (!selectedClass || !selectedSection || !selectedDate) {
            toast({ title: "Incomplete Selection", description: "Please select class, section, and date.", variant: "destructive"});
            return;
        }
        setIsLoading(true);
        setAttendance(null);
        setStudents([]);

        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const [fetchedStudents, fetchedAttendance] = await Promise.all([
                getStudents({ className: selectedClass, sectionName: selectedSection, status: 'Active' }),
                getAttendance(dateStr, selectedClass, selectedSection)
            ]);

            setStudents(fetchedStudents);
            if (fetchedAttendance) {
                setAttendance(fetchedAttendance);
            } else {
                 toast({ title: "No Record", description: "Attendance for this date and class has not been submitted yet." });
            }

        } catch (error) {
            console.error("Error fetching attendance: ", error);
            toast({ title: "Error", description: "Could not fetch attendance data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const getStudentName = (studentId: string) => {
        const student = students.find(s => s.admissionNumber === studentId);
        return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
    };
    
    const getStudentRollNo = (studentId: string) => {
        const student = students.find(s => s.admissionNumber === studentId);
        return student ? student.rollNo : 'N/A';
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">Manage Attendance</h1>
                <p className="text-muted-foreground">View student attendance records.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter Records</CardTitle>
                    <CardDescription>Select class, section, and date to view attendance.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                     <Select onValueChange={setSelectedClass} value={selectedClass}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Class" /></SelectTrigger>
                        <SelectContent>{classOptions.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                    </Select>
                     <Select onValueChange={setSelectedSection} value={selectedSection}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Section" /></SelectTrigger>
                        <SelectContent>{sectionOptions.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-48 justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus /></PopoverContent>
                    </Popover>
                    <Button onClick={handleFetchAttendance} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Fetch Records
                    </Button>
                </CardContent>
            </Card>

            {isLoading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

            {attendance && students.length > 0 && (
                 <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                         <Card>
                            <CardHeader>
                               <CardTitle>Attendance Details</CardTitle>
                                <CardDescription>
                                    Showing records for Class {attendance.className}-{attendance.sectionName} on {format(new Date(attendance.date), 'PPP')}.
                                    Marked by Teacher ID: {attendance.takenBy}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Roll No</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendance.records.map(record => (
                                            <TableRow key={record.studentId}>
                                                <TableCell>{getStudentRollNo(record.studentId)}</TableCell>
                                                <TableCell>{getStudentName(record.studentId)}</TableCell>
                                                <TableCell>{record.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <AttendanceSummary attendance={attendance} />
                    </div>
                 </div>
            )}
        </div>
    );
}
