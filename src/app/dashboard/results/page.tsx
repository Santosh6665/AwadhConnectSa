
'use client';
import { useState, useEffect } from 'react';
import { getStudents } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import StudentResultsList from '@/components/dashboard/common/student-results-list';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function ResultsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const studentData = await getStudents({ status: 'Active' });
        setStudents(studentData);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  if (loading || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const userRole = user.role;
  const filteredStudents = userRole === 'student' 
    ? students.filter(s => s.id === user.uid) 
    : students;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Student Results</h1>
        <p className="text-muted-foreground">
          {userRole === 'student' 
            ? 'View your academic results and performance.' 
            : 'Manage and view results for all students across the school.'}
        </p>
      </div>
      <StudentResultsList initialStudents={filteredStudents} allStudentsForRank={students} userRole={userRole} />
    </div>
  );
}
