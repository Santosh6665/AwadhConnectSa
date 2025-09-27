import StatCard from "@/components/dashboard/stat-card";
import { getFees, getStudents, getTeachers } from "@/lib/firebase/firestore";
import { Users, BookUser, Banknote, Landmark, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EventSuggestionGenerator from "@/components/dashboard/admin/event-suggestion-generator";
import RecentTeachers from "@/components/dashboard/recent-teachers";

const quickActions = [
    { label: "Manage Students", href: "/dashboard/admin/students", icon: Users },
    { label: "Manage Teachers", href: "/dashboard/admin/teachers", icon: BookUser },
    { label: "Fee Management", href: "/dashboard/admin/fees", icon: Banknote },
    { label: "Attendance", href: "/dashboard/admin/attendance", icon: UserCheck },
];

export default async function AdminDashboardPage() {
    const students = await getStudents();
    const teachers = await getTeachers();
    const fees = await getFees();

    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalFeesCollected = fees.reduce((acc, fee) => acc + fee.paidFee, 0);
    const totalDues = fees.reduce((acc, fee) => acc + fee.dueFee, 0);
    const totalSalary = teachers.reduce((acc, teacher) => acc + (teacher.salary || 0), 0);
    
    const sortedTeachers = [...teachers].sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime());

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of the school's activities and stats.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Total Students" value={totalStudents.toString()} icon={Users} description="All active students" />
                <StatCard title="Total Teachers" value={totalTeachers.toString()} icon={BookUser} description="All teaching staff" />
                <StatCard title="Fees Collected" value={`₹${(totalFeesCollected / 1000).toFixed(1)}k`} icon={Banknote} description="This session" />
                <StatCard title="Total Dues" value={`₹${(totalDues / 1000).toFixed(1)}k`} icon={Landmark} description="Pending fees" />
                <StatCard title="Teacher Salary" value={`₹${(totalSalary / 1000).toFixed(1)}k`} icon={Banknote} description="Per month" />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Quickly jump to common management tasks.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            {quickActions.map(action => (
                                <Button key={action.href} variant="outline" className="flex flex-col h-24 gap-2" asChild>
                                    <Link href={action.href}>
                                        <action.icon className="h-6 w-6 text-primary" />
                                        <span className="text-center text-sm">{action.label}</span>
                                    </Link>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                    <RecentTeachers teachers={sortedTeachers} />
                </div>

                <div className="lg:col-span-2">
                  <EventSuggestionGenerator />
                </div>
            </div>
        </div>
    )
}
