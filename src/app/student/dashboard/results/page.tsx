
'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [selectedClass, setSelectedClass] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      const fetchStudentData = async () => {
        setLoading(true);
        const studentData = await getStudentByAdmissionNumber(user.id!);
        setStudent(studentData);
        if (studentData?.className) {
          setSelectedClass(studentData.className);
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

  const classOptions = Object.keys(student.results || {}).sort().reverse();
  const annualResult = student.results?.[selectedClass];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-headline font-bold">My Results</h1>
          <p className="text-muted-foreground">
            View your academic performance and report cards.
          </p>
        </div>
        {classOptions.length > 0 && (
            <Select onValueChange={setSelectedClass} value={selectedClass}>
                <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                    {classOptions.map(c => (
                        <SelectItem key={c} value={c}>Class {c}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
      </div>

      <div className="print-container">
        {annualResult && student ? (
          <ResultCard student={student} annualResult={annualResult} forClass={selectedClass} onDownload={() => window.print()}/>
        ) : (
          <Card className="no-print">
              <CardContent className="p-8 text-center text-muted-foreground">
                  <p>No results found for the selected class.</p>
                  <p>Please select a different class or contact your teacher.</p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
