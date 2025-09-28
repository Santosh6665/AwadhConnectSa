
'use client';
import AttendanceHistory from '@/components/dashboard/common/attendance-history';
import { useAuth } from '@/contexts/auth-context';

export default function AdminAttendanceHistoryPage() {
  const { user } = useAuth();

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
      <AttendanceHistory role="admin" />
    </div>
  );
}
