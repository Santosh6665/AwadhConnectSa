
import StatCard from "@/components/dashboard/stat-card";
import { getStudents, getTeachers } from "@/lib/firebase/firestore";
import type { FeeStructure } from "@/lib/types";
import { Users, BookUser, Banknote, Landmark, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EventSuggestionGenerator from "@/components/dashboard/admin/event-suggestion-generator";
import RecentTeachers from "@/components/dashboard/recent-teachers";
import { getFeeStructure } from "@/lib/firebase/firestore";

const quickActions = [
    { label: "Manage Students", href: "/dashboard/students", icon: Users },
    { label: "Manage Teachers", href: "/dashboard/teachers", icon: BookUser },
    { label: "Fee Management", href: "/dashboard/fees", icon: Banknote },
    { label: "Attendance", href: "/dashboard/attendance", icon: UserCheck },
];

export default async function AdminDashboardPage() {
    const allStudents = await getStudents();
    const allTeachers = await getTeachers();
    const feeStructure = await getFeeStructure();

    const activeStudents = allStudents.filter(s => s.status === 'Active');
    const activeTeachers = allTeachers.filter(t => t.status === 'Active');

    let totalFeesCollected = 0;
    let totalDues = 0;

    allStudents.forEach(student => {
        // Calculate current session's fees
        const currentClassFeeData = student.fees?.[student.className];
        if (currentClassFeeData) {
            const structure = currentClassFeeData.structure || feeStructure?.[student.className];
            if (structure) {
                const annualFee = Object.values(structure).reduce((sum, head) => sum + (head.amount * head.months), 0);
                const concession = currentClassFeeData.concession || 0;
                const totalPayable = annualFee - concession;
                
                const paid = (currentClassFeeData.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
                totalFeesCollected += paid;
                totalDues += Math.max(0, totalPayable - paid);
            }
        }
        // Add previous session's dues
        totalDues += student.previousDue || 0;
    });

    const totalSalary = activeTeachers.reduce((acc, teacher) => acc + (teacher.salary || 0), 0);
    
    const sortedTeachers = [...allTeachers].sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime());

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of the school's activities and stats.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Active Students" value={activeStudents.length.toString()} icon={Users} description={`${allStudents.length} total students`} />
                <StatCard title="Active Teachers" value={activeTeachers.length.toString()} icon={BookUser} description={`${allTeachers.length} total staff`} />
                <StatCard title="Fees Collected" value={`Rs ${(totalFeesCollected / 1000).toFixed(1)}k`} icon={Banknote} description="This session" />
                <StatCard title="Total Dues" value={`Rs ${(totalDues / 1000).toFixed(1)}k`} icon={Landmark} description="Pending fees" />
                <StatCard title="Monthly Salary" value={`Rs ${(totalSalary / 1000).toFixed(1)}k`} icon={Banknote} description="For active staff" />
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
