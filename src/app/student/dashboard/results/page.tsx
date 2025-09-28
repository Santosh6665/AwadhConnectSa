
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getStudentByAdmissionNumber } from '@/lib/firebase/firestore';
import type { Student, AnnualResult } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import ResultCard from '@/components/dashboard/common/result-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function MyResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      const fetchStudentData = async () => {
        setLoading(true);
        const studentData = await getStudentByAdmissionNumber(user.id!);
        setStudent(studentData);
        if (studentData?.session) {
          setSelectedSession(studentData.session);
        }
        setLoading(false);
      };
      fetchStudentData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return <p>Could not load student data.</p>;
  }

  const sessionOptions = Object.keys(student.results || {}).sort().reverse();
  const annualResult = student.results?.[selectedSession];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">My Results</h1>
          <p className="text-muted-foreground">
            View your academic performance and report cards.
          </p>
        </div>
        {sessionOptions.length > 0 && (
            <Select onValueChange={setSelectedSession} value={selectedSession}>
                <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                    {sessionOptions.map(session => (
                        <SelectItem key={session} value={session}>Session {session}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
      </div>

      {annualResult && student ? (
        <ResultCard student={student} annualResult={annualResult} />
      ) : (
        <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
                <p>No results found for the selected session.</p>
                <p>Please select a different session or contact your teacher.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

