
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getParentByMobile, getStudentByAdmissionNumber, getStudents } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import ResultCard from '@/components/dashboard/common/result-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateGrandTotalResult } from '@/lib/utils';

export default function ParentResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classmates, setClassmates] = useState<Student[]>([]);
  const [classmatesLoading, setClassmatesLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const fetchParentData = async () => {
        setLoading(true);
        const parentData = await getParentByMobile(user.id);
        if (parentData?.children) {
          const studentPromises = parentData.children.map(getStudentByAdmissionNumber);
          const studentResults = await Promise.all(studentPromises);
          const validStudents = studentResults.filter((s): s is Student => s !== null);
          setChildren(validStudents);
          if (validStudents.length > 0) {
            const firstChild = validStudents[0];
            setSelectedChild(firstChild);
            if (firstChild.results) {
              const latestClass = Object.keys(firstChild.results).sort().reverse()[0];
              setSelectedClass(latestClass || firstChild.className);
            }
          }
        }
        setLoading(false);
      };
      fetchParentData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      const fetchClassmates = async () => {
        setClassmatesLoading(true);
        const classmatesData = await getStudents({ className: selectedClass });
        setClassmates(classmatesData);
        setClassmatesLoading(false);
      };
      fetchClassmates();
    }
  }, [selectedClass]);

  const childRank = useMemo(() => {
    if (!selectedChild || classmates.length === 0 || !selectedClass) return 0;

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
        if(rankedStudents[i].studentId === selectedChild.admissionNumber){
            return rank;
        }
    }
    
    return 0; // Should not be reached
  }, [selectedChild, classmates, selectedClass]);
  
  const handleChildChange = (admissionNumber: string) => {
    const child = children.find(c => c.admissionNumber === admissionNumber);
    if(child) {
        setSelectedChild(child);
        const latestClass = Object.keys(child.results || {}).sort().reverse()[0];
        setSelectedClass(latestClass || child.className);
    }
  }

  if (authLoading || loading || classmatesLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sessionOptions = selectedChild ? Object.keys(selectedChild.results || {}).sort().reverse() : [];
  const annualResult = selectedChild?.results?.[selectedClass];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>View Child's Results</CardTitle>
          <CardDescription>Select a child and a class to view their report card.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Select onValueChange={handleChildChange} value={selectedChild?.admissionNumber || ''} disabled={children.length === 0}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child.admissionNumber} value={child.admissionNumber}>
                  {child.firstName} {child.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sessionOptions.length > 0 && (
            <Select onValueChange={setSelectedClass} value={selectedClass}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {sessionOptions.map(session => (
                  <SelectItem key={session} value={session}>Class {session}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>
      
      <div className="print-container">
        {annualResult && selectedChild ? (
          <ResultCard student={selectedChild} annualResult={annualResult} forClass={selectedClass} onDownload={() => window.print()} rank={childRank} />
        ) : (
          <Card className="no-print">
            <CardContent className="p-8 text-center text-muted-foreground">
              {selectedChild ? 'No results found for the selected class.' : 'Please select a child to view results.'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
