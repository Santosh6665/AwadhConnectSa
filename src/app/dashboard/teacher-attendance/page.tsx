
'use client';
import { useState, useEffect, useTransition } from 'react';
import { getTeachers, saveTeacherAttendance, getTeacherAttendance } from '@/lib/firebase/firestore';
import type { Teacher, AttendanceStatus, DailyAttendance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Loader2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function AdminTeacherAttendancePage() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceStatus>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        const fetchTeachersAndAttendance = async () => {
            setIsLoading(true);
            setAttendanceRecords(new Map());
            setIsSubmitted(false);

            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const [fetchedTeachers, existingAttendance] = await Promise.all([
                    getTeachers({ status: 'Active' }),
                    getTeacherAttendance(dateStr)
                ]);

                setTeachers(fetchedTeachers);

                if (fetchedTeachers.length === 0) {
                     toast({ title: "No Teachers Found", description: "No active teachers found.", variant: "destructive" });
                     setIsLoading(false);
                     return;
                }

                if (existingAttendance) {
                    const recordsMap = new Map<string, AttendanceStatus>();
                    existingAttendance.records.forEach(rec => {
                        recordsMap.set(rec.studentId, rec.status); // studentId is used for teacherId here
                    });
                    setAttendanceRecords(recordsMap);
                    toast({ title: "Record Found", description: "Editing existing attendance record for teachers." });
                } else {
                    const newRecords = new Map<string, AttendanceStatus>();
                    fetchedTeachers.forEach(teacher => {
                        newRecords.set(teacher.id, 'Present');
                    });
                    setAttendanceRecords(newRecords);
                     toast({ title: "New Record", description: "Marking new teacher attendance. Default is 'Present'." });
                }

            } catch (error) {
                console.error("Error fetching data: ", error);
                toast({ title: "Error", description: "Could not fetch teacher attendance data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeachersAndAttendance();
    }, [selectedDate, toast]);

    const handleStatusChange = (teacherId: string, status: AttendanceStatus) => {
        setAttendanceRecords(prev => new Map(prev).set(teacherId, status));
    };

    const handleSubmit = () => {
        if (!user) {
            toast({ title: "Authentication Error", description: "Could not verify admin identity.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            try {
                const attendanceData = {
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    takenBy: user.email || 'admin',
                    records: Array.from(attendanceRecords.entries()).map(([teacherId, status]) => ({ studentId: teacherId, status })),
                };

                await saveTeacherAttendance(attendanceData);
                setIsSubmitted(true);
                toast({ title: "Success", description: "Teacher attendance submitted successfully." });
            } catch (error) {
                console.error("Error saving teacher attendance: ", error);
                toast({ title: "Error", description: "Failed to submit teacher attendance.", variant: "destructive" });
            }
        });
    };

    const allMarked = teachers.length > 0 && teachers.every(t => attendanceRecords.get(t.id) !== 'Unmarked');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">Teacher Attendance</h1>
                <p className="text-muted-foreground">Mark or edit attendance records for all active teachers.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                    <CardDescription>Choose a date to mark or view attendance.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-64 justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus /></PopoverContent>
                    </Popover>
                </CardContent>
            </Card>

            {isLoading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

            {!isLoading && teachers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Teacher List</CardTitle>
                        <CardDescription>
                            Marking/Editing attendance for {format(selectedDate, 'PPP')}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.map(teacher => (
                                    <TableRow key={teacher.id}>
                                        <TableCell>{teacher.id}</TableCell>
                                        <TableCell>{teacher.name}</TableCell>
                                        <TableCell>{teacher.designation}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <RadioGroup
                                                    value={attendanceRecords.get(teacher.id)}
                                                    onValueChange={(status) => handleStatusChange(teacher.id, status as AttendanceStatus)}
                                                    className="flex gap-4"
                                                    disabled={isSaving}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Present" id={`present-${teacher.id}`} />
                                                        <Label htmlFor={`present-${teacher.id}`}>Present</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Absent" id={`absent-${teacher.id}`} />
                                                        <Label htmlFor={`absent-${teacher.id}`}>Absent</Label>
                                                    </div>
                                                </RadioGroup>
                                                 <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleStatusChange(teacher.id, 'Unmarked')}
                                                    disabled={isSaving}
                                                    className="text-secondary-foreground/80 hover:text-secondary-foreground"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Clear
                                                </Button>
                                            </div>
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

            {!isLoading && teachers.length === 0 && (
                 <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No active teachers found.
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}

