
'use client';
import NoticeBoard from '@/components/dashboard/common/notice-board';
import { useAuth } from '@/contexts/auth-context';

export default function ParentNoticesPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'parent') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-headline font-bold">Notices & Events</h1>
        <p className="text-muted-foreground text-sm">
          Stay informed about school-wide announcements and events relevant to you and your child.
        </p>
      </div>
      <NoticeBoard role="parent" />
    </div>
  );
}
