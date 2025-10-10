
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getStudentByAdmissionNumber } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader2, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PreviousSessionCard from '@/components/student/previous-session-card';
import { Button } from '@/components/ui/button';

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-4 items-start py-2">
    <span className="font-semibold text-muted-foreground text-sm">{label}</span>
    <span className="col-span-1 text-sm">{value || 'N/A'}</span>
  </div>
);

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousSessionIndex, setPreviousSessionIndex] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      const fetchStudentData = async () => {
        setLoading(true);
        const studentData = await getStudentByAdmissionNumber(user.id!);
        setStudent(studentData);
        setLoading(false);
      };
      fetchStudentData();
    }
  }, [user]);

  const processedPreviousSessions = useMemo(() => {
    if (!student?.previousSessions) return [];
    return student.previousSessions.map(session => ({
      ...session,
      dueFee: session.dueFee || 0,
    }));
  }, [student]);

  if (authLoading || loading || !student) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const hasPreviousSessions = processedPreviousSessions.length > 0;

  const handlePreviousSession = () => {
    setPreviousSessionIndex(prev => (prev > 0 ? prev - 1 : prev));
  };
  const handleNextSession = () => {
    setPreviousSessionIndex(prev => (prev < processedPreviousSessions.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {student.firstName}!</p>
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
                <div className="space-y-3 pt-4">
                    <DetailItem label="Admission No." value={student.admissionNumber} />
                    <DetailItem label="Session" value={student.session} />
                    <DetailItem label="Gender" value={student.gender} />
                    <DetailItem label="Date of Birth" value={student.dob} />
                    <DetailItem label="Parent's Name" value={student.parentName} />
                    <DetailItem label="Status" value={<Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>{student.status}</Badge>} />
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          
          {hasPreviousSessions && (
            <Card>
                 <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg"><Calendar className="w-6 h-6 text-primary" /></div>
                            <div>
                                <CardTitle>Previous Sessions</CardTitle>
                                <CardDescription>Your academic history.</CardDescription>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handlePreviousSession} disabled={previousSessionIndex === 0}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                             <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {previousSessionIndex + 1} of {processedPreviousSessions.length}
                            </span>
                            <Button variant="outline" size="icon" onClick={handleNextSession} disabled={previousSessionIndex === processedPreviousSessions.length - 1}>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <PreviousSessionCard student={student} session={processedPreviousSessions[previousSessionIndex]} />
                </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
