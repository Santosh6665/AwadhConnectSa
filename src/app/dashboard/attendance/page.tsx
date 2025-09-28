
'use client';
import { useState, useEffect, useTransition } from 'react';
import { getStudents, saveAttendance, getAttendance } from '@/lib/firebase/firestore';
import type { Student, AttendanceStatus, DailyAttendance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Loader2, Eye, History } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

const classOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];

export default function AdminAttendancePage() {
    const { user } = useAuth();
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceStatus>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const { toast } = useToast();

    useEffect(() => {
        if (initialLoad) return;

        const fetchStudentsAndAttendance = async () => {
            if (!selectedClass || !selectedSection || !selectedDate) return;

            setIsLoading(true);
            setAttendanceRecords(new Map());
            setIsSubmitted(false);

            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const [fetchedStudents, existingAttendance] = await Promise.all([
                    getStudents({ className: selectedClass, sectionName: selectedSection, status: 'Active' }),
                    getAttendance(dateStr, selectedClass, selectedSection)
                ]);

                setStudents(fetchedStudents);

                if (fetchedStudents.length === 0) {
                     toast({ title: "No Students", description: "No active students found for this class.", variant: "destructive" });
                     return;
                }

                if (existingAttendance) {
                    const recordsMap = new Map<string, AttendanceStatus>();
                    existingAttendance.records.forEach(rec => {
                        recordsMap.set(rec.studentId, rec.status);
                    });
                    setAttendanceRecords(recordsMap);
                    toast({ title: "Record Found", description: "Editing existing attendance record." });
                } else {
                    const newRecords = new Map<string, AttendanceStatus>();
                    fetchedStudents.forEach(student => {
                        newRecords.set(student.admissionNumber, 'Present');
                    });
                    setAttendanceRecords(newRecords);
                     toast({ title: "New Record", description: "Marking new attendance. Default status is 'Present'." });
                }

            } catch (error) {
                console.error("Error fetching data: ", error);
                toast({ title: "Error", description: "Could not fetch attendance data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentsAndAttendance();
    }, [selectedClass, selectedSection, selectedDate, toast, initialLoad]);

    const handleFetchData = () => {
        if (!selectedClass || !selectedSection) {
            toast({ title: "Incomplete Selection", description: "Please select a class and section.", variant: "destructive"});
            return;
        }
        setInitialLoad(false);
    }

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceRecords(prev => new Map(prev).set(studentId, status));
    };

    const handleSubmit = () => {
        if (!user) {
            toast({ title: "Authentication Error", description: "Could not verify admin identity.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            try {
                const attendanceData: Omit<DailyAttendance, 'id'> = {
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    className: selectedClass,
                    sectionName: selectedSection,
                    session: students[0]?.session,
                    takenBy: user.email || 'admin',
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

    const allMarked = students.length > 0 && students.every(s => attendanceRecords.has(s.admissionNumber));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">Manage Attendance</h1>
                <p className="text-muted-foreground">Mark or edit student attendance records.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Filter Records</CardTitle>
                            <CardDescription>Select class, section, and date to manage attendance.</CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                           <Link href="/dashboard/attendance-history">
                                <Eye className="mr-2 h-4 w-4" />
                                View History
                           </Link>
                        </Button>
                    </div>
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
                    <Button onClick={handleFetchData} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Fetch Data'}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

            {!isLoading && students.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                        <CardDescription>
                            Marking/Editing attendance for Class {selectedClass}-{selectedSection} on {format(selectedDate, 'PPP')}.
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
                                            <RadioGroup
                                                value={attendanceRecords.get(student.admissionNumber)}
                                                onValueChange={(status) => handleStatusChange(student.admissionNumber, status as AttendanceStatus)}
                                                className="flex gap-4"
                                                disabled={isSaving}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Present" id={`present-${student.admissionNumber}`} />
                                                    <Label htmlFor={`present-${student.admissionNumber}`}>Present</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Absent" id={`absent-${student.admissionNumber}`} />
                                                    <Label htmlFor={`absent-${student.admissionNumber}`}>Absent</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Leave" id={`leave-${student.admissionNumber}`} />
                                                    <Label htmlFor={`leave-${student.admissionNumber}`}>Leave</Label>
                                                </div>
                                            </RadioGroup>
                                        </TableCell>
                                         <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/attendance-history?studentId=${student.admissionNumber}`}>
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
                         <Button onClick={handleSubmit} disabled={isSaving || !allMarked} className="mt-6">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitted ? 'Attendance Submitted' : 'Submit Attendance'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!initialLoad && !isLoading && students.length === 0 && (
                 <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No active students found for the selected class and section, or data has not been fetched.
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
