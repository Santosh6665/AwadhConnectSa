
'use client';
import AttendanceHistory from '@/components/dashboard/common/attendance-history';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'next/navigation';

export default function TeacherAttendanceHistoryPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId') || undefined;

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-headline font-bold">Attendance History</h1>
        <p className="text-muted-foreground">
          View monthly attendance records for students in your classes.
        </p>
      </div>
      <AttendanceHistory role="teacher" teacherId={user.id} studentId={studentId} />
    </div>
  );
}
