
'use client';
import TeacherAttendanceHistory from '@/components/dashboard/teacher/teacher-attendance-history';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'next/navigation';
import { getTeacherById } from '@/lib/firebase/firestore';
import { useEffect, useState } from 'react';
import type { Teacher } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminTeacherAttendanceHistoryPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get('teacherId');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      getTeacherById(teacherId).then(data => {
        setTeacher(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [teacherId]);


  if (user?.role !== 'admin') {
    return <p>Access Denied</p>;
  }
  
  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!teacherId || !teacher) {
    return (
        <div className="space-y-6 text-center">
             <p className="text-muted-foreground">Please provide a valid teacher ID to view history.</p>
             <Button variant="outline" asChild>
                <Link href="/dashboard/teacher-attendance">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Teacher Attendance
                </Link>
             </Button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/teacher-attendance"><ArrowLeft/></Link>
             </Button>
            <div>
                <h1 className="text-3xl font-headline font-bold">Attendance History for {teacher.name}</h1>
                <p className="text-muted-foreground">
                Viewing monthly attendance records for Teacher ID: {teacher.id}
                </p>
            </div>
        </div>
      </div>
      <TeacherAttendanceHistory teacherId={teacherId} />
    </div>
  );
}
