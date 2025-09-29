
'use client';
import NoticeBoard from '@/components/dashboard/common/notice-board';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherNoticesPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Notices & Events</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest school announcements.
        </p>
      </div>
      <NoticeBoard role="teacher" />
    </div>
  );
}
