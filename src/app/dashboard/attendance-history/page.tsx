
'use client';
import AttendanceHistory from '@/components/dashboard/common/attendance-history';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'next/navigation';

export default function AdminAttendanceHistoryPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId') || undefined;

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Attendance History</h1>
        <p className="text-muted-foreground">
          View monthly attendance records for any student.
        </p>
      </div>
      <AttendanceHistory role="admin" studentId={studentId} />
    </div>
  );
}
