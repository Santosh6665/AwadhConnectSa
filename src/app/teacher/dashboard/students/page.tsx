
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getTeacherById, getStudents } from '@/lib/firebase/firestore';
import type { Student, Teacher } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import StudentListForTeacher from '@/components/dashboard/teacher/student-list';

export default function MyStudentsPage() {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const teacherData = await getTeacherById(user.id);
          setTeacher(teacherData);

          if (teacherData && teacherData.classes) {
            const studentPromises = teacherData.classes.map(classStr => {
              const classPartMatch = classStr.match(/^(\d+|[a-zA-Z]+)/);
              const className = classPartMatch ? classPartMatch[0] : '';
              const sectionName = classStr.replace(className, '');

              if (!className || !sectionName) return Promise.resolve([]);
              
              return getStudents({ className, sectionName, status: 'Active' });
            });

            const studentsByClass = await Promise.all(studentPromises);
            const allStudents = studentsByClass.flat();
            setStudents(allStudents);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Students</h1>
        <p className="text-muted-foreground">
          Showing all active students in your assigned classes.
        </p>
      </div>
      <StudentListForTeacher students={students} classes={teacher?.classes || []} />
    </div>
  );
}

    