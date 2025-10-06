
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getTeacherById, getStudents } from '@/lib/firebase/firestore';
import type { Student } from '@/lib/types';
import StudentResultsList from '@/components/dashboard/common/student-results-list';
import { Loader2, ShieldOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TeacherResultsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const teacherData = await getTeacherById(user.id);
          if (teacherData && teacherData.classes) {
            setTeacherClasses(teacherData.classes);
            const studentPromises = teacherData.classes.map(classStr => {
              const classPartMatch = classStr.match(/^(\d+|[a-zA-Z]+)/);
              const className = classPartMatch ? classPartMatch[0] : '';
              const sectionName = classStr.replace(className, '');
              if (!className || !sectionName) return Promise.resolve([]);
              return getStudents({ className, sectionName, status: 'Active' });
            });
            const studentsByClass = await Promise.all(studentPromises);
            setStudents(studentsByClass.flat());
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const canEditResults = user?.canEditResults ?? true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Manage Student Results</h1>
        <p className="text-muted-foreground">
          View, enter, and edit results for students in your classes.
        </p>
      </div>

       {!canEditResults && (
            <Card className="border-destructive bg-destructive/10">
                <CardContent className="p-6 flex items-center gap-4">
                    <ShieldOff className="h-8 w-8 text-destructive" />
                    <div>
                        <h3 className="font-bold text-destructive">Permission Denied</h3>
                        <p className="text-sm text-destructive/80">You do not have permission to edit student results. The view is read-only.</p>
                    </div>
                </CardContent>
            </Card>
        )}

      <StudentResultsList 
        initialStudents={students} 
        userRole="teacher" 
        teacherClasses={teacherClasses}
      />
    </div>
  );
}
