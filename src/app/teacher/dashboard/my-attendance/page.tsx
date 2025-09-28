
'use client';
import TeacherAttendanceHistory from '@/components/dashboard/teacher/teacher-attendance-history';
import { useAuth } from '@/contexts/auth-context';

export default function MyAttendancePage() {
  const { user } = useAuth();

  if (!user || user.role !== 'teacher' || !user.id) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Attendance History</h1>
        <p className="text-muted-foreground">
          View your monthly attendance history.
        </p>
      </div>
      <TeacherAttendanceHistory teacherId={user.id} />
    </div>
  );
}
