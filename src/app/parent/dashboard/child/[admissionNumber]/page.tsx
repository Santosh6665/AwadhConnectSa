
'use client';

import { useEffect, useState } from 'react';
import { getStudentByAdmissionNumber } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader2, ArrowLeft, User, BadgeCheck, BookOpen, Calendar, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PreviousSessionCard from '@/components/student/previous-session-card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-3 gap-4 items-start py-2">
    <span className="font-semibold text-muted-foreground">{label}</span>
    <span className="col-span-2">{value || 'N/A'}</span>
  </div>
);

export default function ChildDetailPage({ params }: { params: { admissionNumber: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/parent/login');
        return;
    }
    
    if (params.admissionNumber) {
      const fetchStudentData = async () => {
        setLoading(true);
        const studentData = await getStudentByAdmissionNumber(params.admissionNumber);
        
        // Security check: Make sure the logged-in parent is authorized to see this student.
        if (user && studentData?.parentMobile !== user.id) {
            router.push('/parent/dashboard'); // Redirect if not their child
            return;
        }

        setStudent(studentData);
        setLoading(false);
      };
      fetchStudentData();
    }
  }, [params.admissionNumber, user, authLoading, router]);

  if (authLoading || loading || !student) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasPreviousSessions = student.previousSessions && student.previousSessions.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/parent/dashboard"><ArrowLeft /></Link>
        </Button>
        <div>
            <h1 className="text-3xl font-headline font-bold">Child Profile</h1>
            <p className="text-muted-foreground">Detailed view of {student.firstName}'s records.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={`https://picsum.photos/seed/${student.admissionNumber}/200/200`} alt={student.firstName} />
                <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{student.firstName} {student.lastName}</CardTitle>
              <CardDescription>Class: {student.className}-{student.sectionName} | Roll No: {student.rollNo}</CardDescription>
            </CardHeader>
            <CardContent>
                <Separator />
                <div className="space-y-3 pt-4 text-sm">
                    <DetailItem label="Admission No." value={student.admissionNumber} />
                    <DetailItem label="Session" value={student.session} />
                    <DetailItem label="Gender" value={student.gender} />
                    <DetailItem label="Date of Birth" value={student.dob} />
                    <DetailItem label="Status" value={<Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>{student.status}</Badge>} />
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            {hasPreviousSessions && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg"><Calendar className="w-6 h-6 text-primary" /></div>
                            <div>
                                <CardTitle>Previous Session History</CardTitle>
                                <CardDescription>Academic and financial records from past years.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {student.previousSessions?.map(session => (
                             <PreviousSessionCard key={session.sessionId} session={session} />
                        ))}
                    </CardContent>
                </Card>
            )}
            {!hasPreviousSessions && (
                 <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No previous session records found for this student.
                    </CardContent>
                 </Card>
            )}
        </div>
      </div>
    </div>
  );
}
