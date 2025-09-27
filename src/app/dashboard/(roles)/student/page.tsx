import StatCard from "@/components/dashboard/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEvents, getFees, getNotices, getStudents } from "@/lib/firebase/firestore";
import { Banknote, Book, BookOpenCheck, Calendar, UserCheck } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { auth } from "@/lib/firebase/config";

export default async function StudentDashboardPage() {
    // This now correctly uses the logged-in user's context.
    // In a real app, you'd fetch the student record based on the auth.currentUser.uid
    const students = await getStudents();
    const student = students.find(s => s.id === 'S01'); // Mock: still using one student for demo

    if (!student) {
        return <p>Student record not found.</p>;
    }
    
    const fees = await getFees();
    const studentFee = fees.find(f => f.studentId === student.id);
    const notices = await getNotices();
    const events = await getEvents();
    
    const relevantNotices = notices.filter(n => ['all', 'student'].includes(n.targetAudience)).slice(0, 2);
    const upcomingEvents = events.filter(e => e.startDate > new Date()).slice(0, 2);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Student Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {student.firstName}!</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Attendance" value="95%" icon={UserCheck} description="This Month" />
                <StatCard title="Overall Grade" value="A+" icon={BookOpenCheck} description="Last Exam" />
                <StatCard title="Fee Status" value={student.feeStatus} icon={Banknote} description={`Due: ₹${studentFee?.dueFee.toLocaleString() || 0}`} />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/student/attendance"><UserCheck className="h-6 w-6" /> My Attendance</Link>
                            </Button>
                             <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/student/results"><BookOpenCheck className="h-6 w-6" /> My Results</Link>
                            </Button>
                             <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/student/materials"><Book className="h-6 w-6" /> Study Materials</Link>
                            </Button>
                             <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/student/fees"><Banknote className="h-6 w-6" /> Fee Details</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>What's New</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {relevantNotices.map(notice => (
                                <div key={notice.id} className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-md mt-1"><Calendar className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <p className="font-semibold">{notice.title}</p>
                                        <p className="text-xs text-muted-foreground">{format(notice.date, 'PPP')}</p>
                                    </div>
                                </div>
                            ))}
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-md mt-1"><Calendar className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <p className="font-semibold">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{format(event.startDate, 'PPP')}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-1">
                    <Card className="text-center">
                        <CardHeader>
                            <Avatar className="h-24 w-24 mx-auto mb-4">
                                <AvatarImage src={`https://picsum.photos/seed/${student.id}/200/200`} alt={student.firstName} />
                                <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="font-headline">{`${student.firstName} ${student.lastName}`}</CardTitle>
                            <CardDescription>Class {student.classId.replace('C', '')}-{student.sectionId.slice(-1)} | Roll No: {student.rollNo}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Admission No: {student.admissionNumber}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
