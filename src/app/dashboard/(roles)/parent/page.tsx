import StatCard from "@/components/dashboard/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEvents, getFees, getNotices, getStudents } from "@/lib/firebase/firestore";
import { Banknote, BookOpenCheck, Calendar, UserCheck } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';

export default async function ParentDashboardPage() {
    // Mock: fetching data for a specific parent 'P01'
    const students = await getStudents();
    const fees = await getFees();
    const notices = await getNotices();
    const events = await getEvents();
    
    const parentId = 'P01';
    const children = students.filter(s => s.parentId === parentId);
    const childrenIds = children.map(c => c.id);
    const childrenFees = fees.filter(f => childrenIds.includes(f.studentId));
    
    const totalDue = childrenFees.reduce((acc, fee) => acc + fee.dueFee, 0);

    const relevantNotices = notices.filter(n => ['all', 'parent'].includes(n.targetAudience)).slice(0, 2);
    const upcomingEvents = events.filter(e => e.startDate > new Date()).slice(0, 2);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Parent Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Here's an overview for your children.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Due Fees" value={`₹${totalDue.toLocaleString()}`} icon={Banknote} description="Across all children" />
            </div>
            
            <div className="space-y-6">
                <h2 className="text-2xl font-headline font-semibold">Your Children</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {children.map(child => (
                        <Card key={child.id}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={`https://picsum.photos/seed/${child.id}/100/100`} alt={child.firstName} />
                                    <AvatarFallback>{child.firstName[0]}{child.lastName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="font-headline">{`${child.firstName} ${child.lastName}`}</CardTitle>
                                    <CardDescription>Class {child.classId.replace('C', '')}-{child.sectionId.slice(-1)} | Roll No: {child.rollNo}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-2 text-center">
                                <Button variant="outline" size="sm" asChild><Link href="/dashboard/parent/attendance"><UserCheck className="mr-1 h-4 w-4" /> Attendance</Link></Button>
                                <Button variant="outline" size="sm" asChild><Link href="/dashboard/parent/results"><BookOpenCheck className="mr-1 h-4 w-4" /> Results</Link></Button>
                                <Button variant="outline" size="sm" asChild><Link href="/dashboard/parent/fees"><Banknote className="mr-1 h-4 w-4" /> Fees</Link></Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Notices & Events</CardTitle></CardHeader>
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
        </div>
    );
}
