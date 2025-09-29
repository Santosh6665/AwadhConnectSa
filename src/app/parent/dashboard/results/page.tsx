
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getParentByMobile, getStudentByAdmissionNumber } from '@/lib/firebase/firestore';
import type { Student, AnnualResult } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import ResultCard from '@/components/dashboard/common/result-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useReactToPrint } from 'react-to-print';

export default function ParentResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>('');

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
            if (firstChild.session) {
              setSelectedSession(firstChild.session);
            }
          }
        }
        setLoading(false);
      };
      fetchParentData();
    }
  }, [user]);
  
  const handleChildChange = (admissionNumber: string) => {
    const child = children.find(c => c.admissionNumber === admissionNumber);
    if(child) {
        setSelectedChild(child);
        setSelectedSession(child.session);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sessionOptions = selectedChild ? Object.keys(selectedChild.results || {}).sort().reverse() : [];
  const annualResult = selectedChild?.results?.[selectedSession];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>View Child's Results</CardTitle>
          <CardDescription>Select a child and a session to view their report card.</CardDescription>
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
        </CardContent>
      </Card>
      
      {annualResult && selectedChild ? (
        <ResultCard ref={componentRef} student={selectedChild} annualResult={annualResult} onDownload={handlePrint}/>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {selectedChild ? 'No results found for the selected session.' : 'Please select a child to view results.'}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
