import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function TeacherDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Teacher Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your personal dashboard.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Welcome!</CardTitle>
                            <CardDescription>This is your space to manage your classes, students, and materials.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>You have successfully logged in. More features coming soon!</p>
                </CardContent>
            </Card>
        </div>
    )
}
