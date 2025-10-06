
'use client';

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookUser, CalendarCheck, PenSquare, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const quickActions = [
    { label: "My Students", href: "/teacher/dashboard/students", icon: Users },
    { label: "Mark Attendance", href: "/teacher/dashboard/attendance", icon: CalendarCheck },
    { label: "Enter Results", href: "/teacher/dashboard/results", icon: PenSquare },
    { label: "Study Materials", href: "/teacher/dashboard/materials", icon: BookUser },
];


export default function TeacherDashboardPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-headline font-bold">Teacher Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user.name}!</p>
            </div>

             <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={`https://picsum.photos/seed/${user.id}/200`} alt={user.name} />
                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle>{user.name}</CardTitle>
                            <CardDescription>Teacher ID: {user.id}</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            {quickActions.map(action => (
                                <Button key={action.href} variant="outline" className="flex flex-col h-24 gap-2 text-center" asChild>
                                    <Link href={action.href}>
                                        <action.icon className="h-6 w-6 text-primary" />
                                        <span className="text-sm">{action.label}</span>
                                    </Link>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Classes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Your schedule for today will appear here.</p>
                        </CardContent>
                    </Card>
                 </div>

             </div>
        </div>
    );
}
