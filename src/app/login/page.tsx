import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, LogIn } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/types";

const roles: { role: UserRole; name: string }[] = [
    { role: 'admin', name: 'Admin' },
    { role: 'teacher', name: 'Teacher' },
    { role: 'parent', name: 'Parent' },
    { role: 'student', name: 'Student' },
];

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <GraduationCap className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl">Welcome to AwadhConnect</CardTitle>
                    <CardDescription>Select your role to login to the dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                        {roles.map(({ role, name }) => (
                            <Button key={role} asChild size="lg">
                                <Link href={`/dashboard/${role}/login`}>
                                    <LogIn className="mr-2 h-5 w-5" />
                                    Login as {name}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
