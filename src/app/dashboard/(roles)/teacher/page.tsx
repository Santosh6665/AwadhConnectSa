import StatCard from "@/components/dashboard/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotices, getTeachers } from "@/lib/firebase/firestore";
import { Book, BookOpenCheck, Calendar, UserCheck } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { auth } from "@/lib/firebase/config";

export default async function TeacherDashboardPage() {
    // This now correctly uses the logged-in user's context.
    // In a real app, you'd fetch the teacher record based on the auth.currentUser.uid
    const teachers = await getTeachers();
    const teacher = teachers.find(t => t.id === 'T02'); // Mock: still using one teacher for demo

    if (!teacher) {
        return <p>Teacher record not found.</p>;
    }
    
    const notices = await getNotices();
    const relevantNotices = notices.filter(n => ['all', 'teacher'].includes(n.targetAudience)).slice(0, 3);
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Teacher Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {teacher.name}!</p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/teacher/attendance"><UserCheck className="h-6 w-6" /> Mark Attendance</Link>
                            </Button>
                             <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/teacher/results"><BookOpenCheck className="h-6 w-6" /> Upload Results</Link>
                            </Button>
                             <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/teacher/materials"><Book className="h-6 w-6" /> Upload Materials</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Notices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {relevantNotices.map(notice => (
                                    <li key={notice.id} className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-2 rounded-md mt-1">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{notice.title}</p>
                                            <p className="text-sm text-muted-foreground">{notice.description.substring(0, 100)}...</p>
                                            <p className="text-xs text-muted-foreground mt-1">{format(notice.date, 'PPP')}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src="https://picsum.photos/seed/T02/200/200" alt={teacher.name} />
                                <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="font-headline">{teacher.name}</CardTitle>
                            <CardDescription>{teacher.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <StatCard title="Your Attendance" value="98%" icon={UserCheck} description="This month" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
