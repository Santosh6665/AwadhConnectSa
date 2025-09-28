
'use client';
import AttendanceHistory from '@/components/dashboard/common/attendance-history';
import { useAuth } from '@/contexts/auth-context';

export default function StudentAttendancePage() {
  const { user } = useAuth();

  if (!user || user.role !== 'student' || !user.id) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Attendance</h1>
        <p className="text-muted-foreground">
          View your monthly attendance history.
        </p>
      </div>
      <AttendanceHistory role="student" studentId={user.id} />
    </div>
  );
}
