
'use client';
import NoticeBoard from '@/components/dashboard/common/notice-board';
import { useAuth } from '@/contexts/auth-context';

export default function StudentNoticesPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Notices & Events</h1>
        <p className="text-muted-foreground">
          Here are the latest announcements and upcoming events for you.
        </p>
      </div>
      <NoticeBoard role="student" />
    </div>
  );
}
