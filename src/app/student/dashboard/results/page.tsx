
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getStudentByAdmissionNumber, getStudents } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import ResultCard from '@/components/dashboard/common/result-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useResultVisibility } from '@/hooks/use-result-visibility';
import { calculateGrandTotalResult } from '@/lib/utils';

// Custom hook to fetch student and class data
function useClassData(userId: string | null, selectedClass: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [classmates, setClassmates] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && selectedClass) {
      const fetchClassData = async () => {
        setLoading(true);
        const studentData = await getStudentByAdmissionNumber(userId);
        setStudent(studentData);

        const classmatesData = await getStudents({ resultForClass: selectedClass });
        setClassmates(classmatesData);
        setLoading(false);
      };
      fetchClassData();
    }
  }, [userId, selectedClass]);

  return { student, classmates, loading };
}

export default function MyResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const { settings: visibilitySettings, loading: settingsLoading } = useResultVisibility();
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classOptions, setClassOptions] = useState<string[]>([]);

  // Initial fetch to get student's classes and set the latest one as selected
  useEffect(() => {
    if (user?.id) {
      const fetchInitialData = async () => {
        const studentData = await getStudentByAdmissionNumber(user.id!);
        if (studentData?.results) {
          const availableClasses = Object.keys(studentData.results).sort().reverse();
          setClassOptions(availableClasses);
          if (availableClasses.length > 0) {
            setSelectedClass(availableClasses[0]);
          }
        }
        setInitialLoading(false);
      };
      fetchInitialData();
    }
  }, [user]);

  const { student, classmates, loading: classDataLoading } = useClassData(user?.id || null, selectedClass);

  const studentRank = useMemo(() => {
    if (!student || classmates.length === 0 || !selectedClass) return 0;

    const rankedStudents = classmates.map(s => {
      const annualResult = s.results?.[selectedClass];
      const { percentage } = calculateGrandTotalResult(annualResult);
      return { studentId: s.admissionNumber, percentage };
    });

    rankedStudents.sort((a, b) => b.percentage - a.percentage);
    
    let rank = 0;
    for(let i = 0; i < rankedStudents.length; i++){
        if(i > 0 && rankedStudents[i].percentage < rankedStudents[i-1].percentage){
            rank = i + 1;
        } else if (i === 0) {
            rank = 1;
        }
        if(rankedStudents[i].studentId === student.admissionNumber){
            return rank;
        }
    }
    
    return 0; // Should not be reached
  }, [student, classmates, selectedClass]);

  const loading = authLoading || settingsLoading || initialLoading || classDataLoading;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return <p>Could not load student data.</p>;
  }

  const annualResult = student.results?.[selectedClass];

  const isCurrentSession = classOptions.length > 0 && selectedClass === classOptions[0];
  const filteredAnnualResult = isCurrentSession && visibilitySettings && annualResult
    ? {
      ...annualResult,
      examResults: {
        ...(visibilitySettings.showQuarterly && annualResult.examResults.Quarterly ? { Quarterly: annualResult.examResults.Quarterly } : {}),
        ...(visibilitySettings.showHalfYearly && annualResult.examResults['Half-Yearly'] ? { 'Half-Yearly': annualResult.examResults['Half-Yearly'] } : {}),
        ...(visibilitySettings.showAnnual && annualResult.examResults.Annual ? { Annual: annualResult.examResults.Annual } : {}),
      }
    }
    : annualResult;

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
        {filteredAnnualResult && Object.keys(filteredAnnualResult.examResults || {}).length > 0 && student ? (
          <ResultCard student={student} annualResult={filteredAnnualResult} forClass={selectedClass} onDownload={() => window.print()} rank={studentRank}/>
        ) : (
          <Card className="no-print">
              <CardContent className="p-8 text-center text-muted-foreground">
                  <p>Results for the selected class are not available or have not been published yet.</p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
