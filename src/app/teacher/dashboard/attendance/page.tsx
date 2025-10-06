
'use client';
import { useState, useEffect, useTransition } from 'react';
import { getStudents, saveAttendance, getAttendance } from '@/lib/firebase/firestore';
import type { Student, AttendanceStatus, DailyAttendance, Teacher } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Loader2, Eye, History, XCircle, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function MarkAttendancePage() {
    const { user } = useAuth();
    const [selectedClassSection, setSelectedClassSection] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceStatus>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { toast } = useToast();

    // The `user` object from useAuth now contains real-time teacher data, including permissions.
    const canMarkAttendance = user?.canMarkAttendance ?? false;
    const teacherClasses = (user as Teacher)?.classes || [];


    useEffect(() => {
        const fetchStudentsAndAttendance = async () => {
            if (!selectedClassSection || !selectedDate || !user) return;
            
            const [className, sectionName] = parseClassSection(selectedClassSection);
            if (!className || !sectionName) return;

            setIsLoading(true);
            setAttendanceRecords(new Map());
            setIsSubmitted(false);

            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const [fetchedStudents, existingAttendance] = await Promise.all([
                    getStudents({ className, sectionName, status: 'Active' }),
                    getAttendance(dateStr, className, sectionName)
                ]);

                setStudents(fetchedStudents);

                if (existingAttendance) {
                    const recordsMap = new Map<string, AttendanceStatus>();
                    existingAttendance.records.forEach(rec => {
                        recordsMap.set(rec.studentId, rec.status);
                    });
                    setAttendanceRecords(recordsMap);
                    setIsSubmitted(true);
                    toast({ title: "Already Submitted", description: "Attendance for this date has already been recorded." });
                } else {
                    const newRecords = new Map<string, AttendanceStatus>();
                    fetchedStudents.forEach(student => {
                        newRecords.set(student.admissionNumber, 'Present');
                    });
                    setAttendanceRecords(newRecords);
                }

            } catch (error) {
                console.error("Error fetching students: ", error);
                toast({ title: "Error", description: "Could not fetch student data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentsAndAttendance();
    }, [selectedClassSection, selectedDate, toast, user]);

    const parseClassSection = (classSection: string) => {
        if (!classSection) return ['', ''];
        const classPartMatch = classSection.match(/^(\d+|[a-zA-Z]+)/);
        const className = classPartMatch ? classPartMatch[0] : '';
        const sectionName = classSection.replace(className, '');
        return [className, sectionName];
    };

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceRecords(prev => new Map(prev).set(studentId, status));
    };

    const handleSubmit = () => {
        if (!user || !user.id || !selectedClassSection) {
            toast({ title: "Authentication or Selection Error", description: "Could not verify teacher or class selection.", variant: "destructive" });
            return;
        }

        if (!canMarkAttendance) {
            toast({ title: "Permission Denied", description: "You do not have permission to mark attendance.", variant: "destructive" });
            return;
        }

        const [className, sectionName] = parseClassSection(selectedClassSection);

        startTransition(async () => {
            try {
                const attendanceData: Omit<DailyAttendance, 'id'> = {
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    className: className,
                    sectionName: sectionName,
                    session: students[0]?.session, 
                    takenBy: user.id!,
                    records: Array.from(attendanceRecords.entries()).map(([studentId, status]) => ({ studentId, status })),
                };

                await saveAttendance(attendanceData);
                setIsSubmitted(true);
                toast({ title: "Success", description: "Attendance submitted successfully." });
            } catch (error) {
                console.error("Error saving attendance: ", error);
                toast({ title: "Error", description: "Failed to submit attendance.", variant: "destructive" });
            }
        });
    };

    const allMarked = students.length > 0 && students.every(s => attendanceRecords.get(s.admissionNumber) !== 'Unmarked');
    const [className, sectionName] = parseClassSection(selectedClassSection);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">Mark Attendance</h1>
                <p className="text-muted-foreground">Select class, section, and date to mark student attendance.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Select Class & Date</CardTitle>
                         <Button variant="outline" asChild>
                           <Link href="/teacher/dashboard/attendance-history">
                                <Eye className="mr-2 h-4 w-4" />
                                View History
                           </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                     <Select onValueChange={setSelectedClassSection} value={selectedClassSection} disabled={!canMarkAttendance}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Class" /></SelectTrigger>
                        <SelectContent>{teacherClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-48 justify-start text-left font-normal" disabled={!canMarkAttendance}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus /></PopoverContent>
                    </Popover>
                </CardContent>
            </Card>

            {!canMarkAttendance && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <ShieldOff className="h-8 w-8 text-destructive" />
                        <div>
                            <h3 className="font-bold text-destructive">Permission Denied</h3>
                            <p className="text-sm text-destructive/80">You do not have permission to mark or edit student attendance. Please contact the administrator.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading && canMarkAttendance && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

            {!isLoading && students.length > 0 && canMarkAttendance && (
                <Card>
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                        <CardDescription>
                            Mark attendance for Class {className}-{sectionName} on {format(selectedDate, 'PPP')}.
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
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => (
                                    <TableRow key={student.admissionNumber}>
                                        <TableCell>{student.rollNo}</TableCell>
                                        <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <RadioGroup
                                                    value={attendanceRecords.get(student.admissionNumber)}
                                                    onValueChange={(status) => handleStatusChange(student.admissionNumber, status as AttendanceStatus)}
                                                    className="flex gap-4"
                                                    disabled={isSaving || isSubmitted}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Present" id={`present-${student.admissionNumber}`} />
                                                        <Label htmlFor={`present-${student.admissionNumber}`}>Present</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Absent" id={`absent-${student.admissionNumber}`} />
                                                        <Label htmlFor={`absent-${student.admissionNumber}`}>Absent</Label>
                                                    </div>
                                                </RadioGroup>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleStatusChange(student.admissionNumber, 'Unmarked')}
                                                    disabled={isSaving || isSubmitted}
                                                    className="text-secondary-foreground/80 hover:text-secondary-foreground"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Clear
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/teacher/dashboard/attendance-history?studentId=${student.admissionNumber}`}>
                                                    <History className="mr-2 h-4 w-4" />
                                                    History
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                         <Button onClick={handleSubmit} disabled={isSaving || isSubmitted || !allMarked} className="mt-6">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitted ? 'Attendance Submitted' : 'Submit Attendance'}
                        </Button>
                    </CardContent>
                </Card>
            )}

             {!isLoading && students.length === 0 && selectedClassSection && canMarkAttendance && (
                 <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No active students found for the selected class and section.
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
