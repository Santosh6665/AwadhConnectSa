
'use client';
import AttendanceHistory from '@/components/dashboard/common/attendance-history';
import { useAuth } from '@/contexts/auth-context';

export default function ParentAttendancePage() {
  const { user } = useAuth();

  if (!user || user.role !== 'parent' || !user.id) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-headline font-bold">Children's Attendance</h1>
        <p className="text-muted-foreground text-sm">
          View monthly attendance records for your children.
        </p>
      </div>
      <AttendanceHistory role="parent" parentId={user.id} />
    </div>
  );
}
