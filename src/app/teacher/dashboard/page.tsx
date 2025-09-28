
'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import type { Teacher } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserCircle } from 'lucide-react';


const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 py-3 border-b">
        <Label className="font-semibold text-muted-foreground">{label}</Label>
        <div className="col-span-2 text-sm">{value || 'N/A'}</div>
    </div>
);


export default function TeacherDashboardPage() {
    const { teacherDetails, loading } = useAuth();

    if (loading || !teacherDetails) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const teacher = teacherDetails as Teacher;

    return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-headline font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {teacher.name}!</p>
        </div>
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://picsum.photos/seed/${teacher.id}/100/100`} alt={teacher.name} />
                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                    <CardDescription>{teacher.designation}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="mt-4">
                    <DetailItem label="Teacher ID" value={teacher.id} />
                    <DetailItem label="Email" value={teacher.email} />
                    <DetailItem label="Phone Number" value={teacher.phone} />
                    <DetailItem label="Gender" value={teacher.gender} />
                    <DetailItem label="Date of Birth" value={teacher.dob} />
                    <DetailItem label="Hire Date" value={teacher.hireDate} />
                    <DetailItem 
                        label="Subjects" 
                        value={
                            <div className="flex flex-wrap gap-1">
                                {teacher.subjects?.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                            </div>
                        } 
                    />
                    <DetailItem 
                        label="Classes" 
                        value={
                             <div className="flex flex-wrap gap-1">
                                {teacher.classes?.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
                            </div>
                        } 
                    />
                    <DetailItem 
                        label="Status" 
                        value={
                            <Badge variant={teacher.status === 'Active' ? 'default' : 'destructive'}>
                                {teacher.status}
                            </Badge>
                        } 
                    />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
